import { Request, Response } from "express";
import { supabase } from "../services/supabaseClient";
import { CartItemWithProduct } from "../models/CartItems";

export const getCart = async (req: Request, res: Response) => {
  const user = (req as any).user;

  // Buscar el carrito del usuario
  const { data: cart, error: cartError } = await supabase
    .from("cart")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (cartError || !cart) {
    return res.status(404).json({ message: "Carrito no encontrado" });
  }

  // Obtener los ítems del carrito
  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select(`
      id,
      cart_id,
      quantity,
      product_id,
      products (name, price)
    `)
    .eq("cart_id", cart.id);

  if (itemsError) {
    return res
      .status(500)
      .json({ message: "Error al obtener ítems del carrito" });
  }

  res.json({
    cart_id: cart.id,
    items: items as CartItemWithProduct[],
  });
};

export const addToCart = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    return res
      .status(400)
      .json({ message: "product_id y quantity son requeridos" });
  }

  // 1. Buscar o crear carrito del usuario
  let { data: cart } = await supabase
    .from("cart")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!cart) {
    const { data: newCart, error: createError } = await supabase
      .from("cart")
      .insert([{ user_id: user.id }])
      .select()
      .single();

    if (createError) {
      return res
        .status(500)
        .json({ message: "Error al crear carrito", error: createError.message });
    }

    cart = newCart;
  }

  // 2. Verificar si ya existe ese producto en el carrito
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart!.id)
    .eq("product_id", product_id)
    .single();

  if (existingItem) {
    // 3a. Si ya existe, sumamos la cantidad
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id);

    if (updateError) {
      return res
        .status(500)
        .json({ message: "Error al actualizar ítem del carrito" });
    }

    return res.json({ message: "Cantidad actualizada en el carrito" });
  }

  // 3b. Si no existe, insertamos nuevo ítem
  const { error: insertError } = await supabase
    .from("cart_items")
    .insert([
      {
        cart_id: cart!.id,
        product_id,
        quantity,
      },
    ]);

  if (insertError) {
    return res
      .status(500)
      .json({ message: "Error al agregar ítem al carrito" });
  }

  res.status(201).json({ message: "Producto agregado al carrito" });
};

export const updateCartItemQuantity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'La cantidad debe ser mayor que 0' });
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ message: 'Error al actualizar cantidad', error: error.message });
  }

  res.json({ message: 'Cantidad actualizada exitosamente' });
};


export const deleteCartItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ message: 'Error al eliminar ítem del carrito', error: error.message });
  }

  res.json({ message: 'Ítem eliminado del carrito' });
};
