import {Request, Response, NextFunction } from "express";
import {supabase} from "../services/supabaseClient";

export const authorizeAdmin = async( req: Request, res:Response, next:NextFunction) => {
    const user = (req as any).user; //mal corregir por uso de extends

    if( !user || !user.id ){
        return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const { data, error} = await supabase.from("users").select("role").eq("id", user.id).single();

    if (error || !data) {
        return res.status(500).json({ message: "Acceso denegado, error al consultar el rol de usuario" });
    }

    if (data.role !== "admin") {
        return res.status(500).json({ message: "Acceso denegado" });
    }

    next();
}