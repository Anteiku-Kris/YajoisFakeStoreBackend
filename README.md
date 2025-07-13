# 🦊 YajoisFakeStore - Documentación Base de Datos Supabase

Proyecto universitario de eCommerce ficticio basado en la marca *Yajois*. Esta documentación describe la estructura de la base de datos creada en Supabase, el flujo de autenticación y las operaciones realizadas hasta la fecha.

---

## 📁 Estructura de la Base de Datos

### Tablas creadas:

#### 1. `users`
- `id` (UUID, PK) - debe coincidir con `auth.users.id`
- `name` (text)
- `role` (enum: 'customer' (default), 'admin')
- `created_at` (timestamp)

#### 2. `categories`
- `id` (UUID, PK)
- `name` (text, unique)
- `description` (text)
- `created_at` (timestamp)

#### 3. `products`
- `id` (UUID, PK)
- `name` (text)
- `description` (text)
- `price` (numeric)
- `stock` (integer)
- `category_id` (FK)
- `created_at` (timestamp)

#### 4. `product_images`
- `id` (UUID, PK)
- `product_id` (FK)
- `image_url` (text)
- `alt_text` (text)

#### 5. `orders`
- `id` (UUID, PK)
- `user_id` (FK)
- `status` (enum: 'pending' (default), 'paid', 'cancelled')
- `total` (numeric)
- `payment_method` (text)
- `created_at` (timestamp)

#### 6. `order_items`
- `id` (UUID, PK)
- `order_id` (FK)
- `product_id` (FK)
- `quantity` (int)
- `price` (numeric)

#### 7. `addresses`
- `id` (UUID, PK)
- `user_id` (FK)
- `address_line`, `city`, `state`, `postal_code`, `country`

#### 8. `reviews`
- `id` (UUID, PK)
- `user_id` (FK)
- `product_id` (FK)
- `rating` (int, 1-5)
- `comment` (text)
- `created_at` (timestamp)

#### 9. `cart`, `cart_items`
- Tablas creadas pero **no utilizadas aún** (quedaron pendientes para el frontend)

---

## 🚚 Supabase Storage

- Se creó un bucket público llamado `product-images`
- Contiene imágenes como:
  - `OliveGreenHoodie.png`
  - `KhakiCargoPants.png`
  - `RuggedLeatherBoots.png`
- Las URLs de estas imágenes se almacenan en la tabla `product_images`

---

## 🔐 Autenticación con Supabase

- Se utiliza `auth.users` para manejar correo electrónico y contraseñas cifradas
- Se elimina el campo `email` de la tabla `users` personalizada
- Se crea manualmente el perfil en la tabla `users` con el mismo `id` que `auth.users.id`

Ejemplo de inserción de perfil:
```sql
insert into users (id, name, role)
values ('uuid-del-auth-user', 'Kristopher Castillo', 'admin');
```

---

## 🔢 Vista creada: `user_purchase_history_with_reviews`

Consulta unificada del historial de compras con reseñas:
```sql
create view user_purchase_history_with_reviews as
select
  o.id as order_id,
  o.user_id,
  o.created_at as order_date,
  p.name as product_name,
  oi.price,
  oi.quantity,
  r.rating,
  r.comment
from orders o
join order_items oi on oi.order_id = o.id
join products p on p.id = oi.product_id
left join reviews r 
  on r.user_id = o.user_id and r.product_id = p.id;
```

---

## 📌 Diagrama de relaciones (texto)

```
users ─┬─ orders ─┬─ order_items ─┬─ products
       │          └─ addresses    │
       └──────────── reviews      └─ product_images

categories ────────┘
```

---

## ✅ Pendientes/Futuros pasos
- Crear endpoints con Node.js + Express
- Activar Row-Level Security (RLS) en la tabla `users`
- Implementar `cart` y `checkout` desde el frontend
- Agregar funciones automáticas post-registro de usuarios

---

> Documentado por Kristopher Castillo para el proyecto universitario **YajoisFakeStore** - 2025
