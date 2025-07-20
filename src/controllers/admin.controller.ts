import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, stock, category_id } = req.body;

  if (!name || !price || !stock || !category_id) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name,
        description,
        price,
        stock,
        category_id
      }
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }

  res.status(201).json({ message: 'Producto creado exitosamente', product: data });
};

