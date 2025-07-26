import { Request, Response } from "express";
import { supabase } from "../services/supabaseClient";
import { CartItemWithProduct } from "../models/CartItems";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { UserPurchaseHistory } from "../models/UserPurchaseHistory";
import {Review} from "../models/Review"
import { Address } from "../models/Address";


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

export const createOrder = async(req:Request, res:Response) => {
  const user = (req as any).user;
  const { payment_method } = req.body;

  if (!payment_method) {
    return res.status(400).json({ message: 'payment_method es requerido' });
  }

  // 1. Obtener carrito
  const { data: cart, error: cartError } = await supabase
    .from('cart')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (cartError || !cart) {
    return res.status(404).json({ message: 'No se encontró carrito' });
  }

  // 2. Obtener ítems del carrito
  const { data: cartItems, error: itemsError } = await supabase
    .from('cart_items')
    .select('product_id, quantity, products (price)')
    .eq('cart_id', cart.id);

  if (itemsError || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'El carrito está vacío' });
  }

  // 3. Calcular total
  let total = 0;
  const orderItems: Partial<OrderItem>[] = [];

  for (const item of cartItems) {
    const price = item.products?.[0]?.price || 0;
    total += item.quantity * price;

    orderItems.push({
      product_id: item.product_id,
      quantity: item.quantity,
      price: price,
    });
  }

  // 4. Insertar orden
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_id: user.id,
        status: 'pending',
        total,
        payment_method,
      },
    ])
    .select()
    .single();

  if (orderError || !order) {
    return res.status(500).json({ message: 'Error al crear orden' });
  }

  // 5. Insertar order_items
  const itemsToInsert = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsInsertError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsInsertError) {
    return res.status(500).json({ message: 'Error al insertar ítems de la orden' });
  }

  // 6. Vaciar carrito
  await supabase.from('cart_items').delete().eq('cart_id', cart.id);

  res.status(201).json({
    message: 'Orden creada exitosamente',
    order_id: order.id,
    total,
  });
}

export const getUserPurchaseHistory = async (req: Request, res: Response) => {
  const user = (req as any).user;

  const { data, error } = await supabase
    .from('user_purchase_history_with_reviews')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return res.status(500).json({
      message: 'Error al obtener historial de compras',
      error: error.message,
    });
  }

  res.json({
    history: data as UserPurchaseHistory[],
  });
};

export const createReview = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { product_id, rating, comment } = req.body;

  if (!product_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: 'product_id y rating (1-5) son requeridos',
    });
  }

  // Verificar que el usuario haya comprado este producto
  // Primero, obtener órdenes del usuario
const { data: userOrders, error: ordersError } = await supabase
  .from('orders')
  .select('id')
  .eq('user_id', user.id);

if (ordersError || !userOrders || userOrders.length === 0) {
  return res.status(403).json({
    message: 'No tienes órdenes registradas aún',
  });
}

const orderIds = userOrders.map((o) => o.id);

// Luego, verificar si el producto fue comprado
const { data: purchase, error: purchaseError } = await supabase
  .from('order_items')
  .select('id')
  .eq('product_id', product_id)
  .in('order_id', orderIds);


  if (purchaseError || !purchase || purchase.length === 0) {
    return res.status(403).json({
      message: 'Solo puedes reseñar productos que hayas comprado',
    });
  }

  // Verificar si ya existe reseña para este producto y usuario
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single();

  if (existingReview) {
    return res.status(409).json({
      message: 'Ya has dejado una reseña para este producto',
    });
  }

  // Insertar reseña
  const { data: newReview, error: insertError } = await supabase
    .from('reviews')
    .insert([
      {
        user_id: user.id,
        product_id,
        rating,
        comment,
      },
    ])
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({
      message: 'Error al insertar reseña',
      error: insertError.message,
    });
  }

  res.status(201).json({
    message: 'Reseña creada exitosamente',
    review: newReview as Review,
  });
};

export const getMyAddresses = async (req: Request, res: Response) => {
  const user = (req as any).user;

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return res.status(500).json({
      message: 'Error al obtener direcciones',
      error: error.message,
    });
  }

  res.json({ addresses: data as Address[] });
};

export const addAddress = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const {
    address_line,
    city,
    state,
    postal_code,
    country,
  } = req.body;

  if (!address_line || !city || !state || !postal_code || !country) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert([
      {
        user_id: user.id,
        address_line,
        city,
        state,
        postal_code,
        country,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      message: 'Error al guardar la dirección',
      error: error.message,
    });
  }

  res.status(201).json({
    message: 'Dirección guardada exitosamente',
    address: data,
  });
};
