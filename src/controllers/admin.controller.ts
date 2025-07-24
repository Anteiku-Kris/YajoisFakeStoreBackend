import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';


export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, stock, category_id } = req.body;
  const imageFile = req.file;

  if (!name || !price || !stock || !category_id || !imageFile) {
    return res.status(400).json({ message: 'Todos los campos y una imagen son requeridos' });
  }

  // 1. Insertamos producto
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert([{ name, description, price, stock, category_id }])
    .select()
    .single();

  if (productError) {
    return res.status(500).json({ message: 'Error al crear producto', error: productError.message });
  }

  // 2. Subimos imagen a Supabase Storage
  const imageName = `product-${product.id}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(imageName, imageFile.buffer, {
      contentType: imageFile.mimetype,
      upsert: true,
    });

  if (uploadError) {
    return res.status(500).json({ message: 'Error al subir imagen', error: uploadError.message });
  }

  // 3. Insertamos en tabla product_images
  const publicUrl = supabase.storage.from('product-images').getPublicUrl(imageName).data.publicUrl;

  await supabase.from('product_images').insert([
    {
      product_id: product.id,
      image_url: publicUrl,
      alt_text: name,
    },
  ]);

  res.status(201).json({
    message: 'Producto creado con imagen',
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
    .from('products')
    .update({ name, description, price, stock, category_id })
    .eq('id', id);

  if (updateError) {
    return res.status(500).json({ message: 'Error al actualizar producto', error: updateError.message });
  }

  // 2. Si viene imagen nueva, la reemplazamos
  let imageUrl: string | null = null;

  if (imageFile) {
    // Nombre único para nueva imagen
    const imageName = `product-${id}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(imageName, imageFile.buffer, {
        contentType: imageFile.mimetype,
        upsert: true,
      });

    if (uploadError) {
      return res.status(500).json({ message: 'Error al subir imagen', error: uploadError.message });
    }

    // URL pública
    imageUrl = supabase.storage.from('product-images').getPublicUrl(imageName).data.publicUrl;

    // Eliminar la(s) imagen(es) anterior(es)
    const { data: oldImages } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', id);

    if (oldImages) {
      for (const img of oldImages) {
        const filePath = img.image_url.split('/product-images/')[1];
        await supabase.storage.from('product-images').remove([filePath]);
      }
    }

    // Insertar nueva referencia
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id);

    await supabase
      .from('product_images')
      .insert([{ product_id: id, image_url: imageUrl, alt_text: name }]);
  }

  res.json({
    message: 'Producto actualizado correctamente',
    updated_fields: { name, description, price, stock, category_id },
    ...(imageUrl && { image_url: imageUrl }),
  });
};
