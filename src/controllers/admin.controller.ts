import { Request, Response } from "express";
import { supabase } from "../services/supabaseClient";

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, stock, category_id } = req.body;
  const imageFile = req.file;

  if (!name || !price || !stock || !category_id || !imageFile) {
    return res
      .status(400)
      .json({ message: "Todos los campos y una imagen son requeridos" });
  }

  // 1. Insertamos producto
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert([{ name, description, price, stock, category_id }])
    .select()
    .single();

  if (productError) {
    return res.status(500).json({
      message: "Error al crear producto",
      error: productError.message,
    });
  }

  // 2. Subimos imagen a Supabase Storage
  const imageName = `product-${product.id}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(imageName, imageFile.buffer, {
      contentType: imageFile.mimetype,
      upsert: true,
    });

  if (uploadError) {
    return res
      .status(500)
      .json({ message: "Error al subir imagen", error: uploadError.message });
  }

  // 3. Insertamos en tabla product_images
  const publicUrl = supabase.storage
    .from("product-images")
    .getPublicUrl(imageName).data.publicUrl;

  await supabase.from("product_images").insert([
    {
      product_id: product.id,
      image_url: publicUrl,
      alt_text: name,
    },
  ]);

  res.status(201).json({
    message: "Producto creado con imagen",
    product,
    image_url: publicUrl,
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock, category_id } = req.body;
  const imageFile = req.file;

  // 1. Actualizamos los campos del producto
  const { error: updateError } = await supabase
    .from("products")
    .update({ name, description, price, stock, category_id })
    .eq("id", id);

  if (updateError) {
    return res.status(500).json({
      message: "Error al actualizar producto",
      error: updateError.message,
    });
  }

  // 2. Si viene imagen nueva, la reemplazamos
  let imageUrl: string | null = null;

  if (imageFile) {
    // Nombre único para nueva imagen
    const imageName = `product-${id}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(imageName, imageFile.buffer, {
        contentType: imageFile.mimetype,
        upsert: true,
      });

    if (uploadError) {
      return res
        .status(500)
        .json({ message: "Error al subir imagen", error: uploadError.message });
    }

    // URL pública
    imageUrl = supabase.storage.from("product-images").getPublicUrl(imageName)
      .data.publicUrl;

    // Eliminar la(s) imagen(es) anterior(es)
    const { data: oldImages } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", id);

    if (oldImages) {
      for (const img of oldImages) {
        const filePath = img.image_url.split("/product-images/")[1];
        await supabase.storage.from("product-images").remove([filePath]);
      }
    }

    // Insertar nueva referencia
    await supabase.from("product_images").delete().eq("product_id", id);

    await supabase
      .from("product_images")
      .insert([{ product_id: id, image_url: imageUrl, alt_text: name }]);
  }

  res.json({
    message: "Producto actualizado correctamente",
    updated_fields: { name, description, price, stock, category_id },
    ...(imageUrl && { image_url: imageUrl }),
  });
};

// función para subir imagen de producto

export const uploadProductImage = async (req: Request, res: Response) => {
  const { product_id, alt_text } = req.body;
  const imageFile = req.file;

  if (!product_id || !imageFile) {
    return res
      .status(400)
      .json({ message: "El ID del producto y la imagen son requeridos" });
  }

  //verificación exitosa del producto
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", product_id)
    .single();

  if (productError || !product) {
    return res.status(400).json({ message: "Producto no encontrado" });
  }

  //Colocarle nombre al archivo
  const imageName = `gallery-${product_id}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(imageName, imageFile.buffer, {
      contentType: imageFile.mimetype,
      upsert: true,
    });
  if (uploadError) {
    return res
      .status(500)
      .json({ message: "Error al subir imagen", error: uploadError.message });
  }

  const publicUrl = supabase.storage
    .from("product-images")
    .getPublicUrl(imageName).data.publicUrl;

  await supabase.from("product_images").insert([
    {
      product_id,
      image_url: publicUrl,
      alt_text: alt_text || `Imagen adicional del producto ${product_id}`,
    },
  ]);

  res.status(201).json({
    message: "Imagen adicional subida correctamente",
    image_url: publicUrl,
  });
};

//Función para eliminar la imagen del producto... en caso de que alguien *uff* suba una imagen equivocada o quiera actualizarla

export const deleteProductImage = async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. Buscar la imagen en la tabla
  const { data: image, error: fetchError } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError || !image) {
    return res.status(404).json({ message: "Imagen no encontrada" });
  }

  // 2. Extraer path del archivo desde la URL pública
  const pathParts = image.image_url.split("/product-images/");
  const filePath = pathParts[1];

  if (!filePath) {
    return res
      .status(400)
      .json({
        message: "No se pudo identificar la ruta del archivo en Storage",
      });
  }

  // 3. Eliminar de Supabase Storage
  const { error: storageError } = await supabase.storage
    .from("product-images")
    .remove([filePath]);

  if (storageError) {
    return res
      .status(500)
      .json({
        message: "Error al eliminar la imagen del Storage",
        error: storageError.message,
      });
  }

  // 4. Eliminar registro en la tabla
  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return res
      .status(500)
      .json({
        message: "Error al eliminar registro de la imagen",
        error: deleteError.message,
      });
  }

  res.json({ message: "Imagen eliminada exitosamente", id });
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role, created_at");

  if (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: error.message });
  }

  res.json({ users: data });
};
