import { Request, Response } from "express";
import { supabase } from "../services/supabaseClient";

export const getAllCategories = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (
        id,
        image_url,
        alt_text
      )
    `
    )
    .eq("category_id", id);

  if (error) {
    throw new Error(error.message);
  }
  res.json(data);
};

