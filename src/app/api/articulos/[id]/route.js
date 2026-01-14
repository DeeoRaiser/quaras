// ==========================
// POST → CREAR ARTÍCULO
// ==========================
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await req.json();

    console.log(data)
    
    const {
      descripcion,
      precio,
      iva_id,
      descuentos = [],
      precio_neto,
      utilidad,
      precio_venta,
      maneja_stock,
      nota,
      familia_id,
      categoria_id,
      clasificacion_id,
      codigo,
      centro_costo_id
    } = data;

    if (!descripcion)
      return NextResponse.json({ error: "Descripción obligatoria" }, { status: 400 });

    const conn = await getConnection();

    const [res] = await conn.execute(
      `
      INSERT INTO articulos (
        descripcion,
        precio,
        iva_id,
        descuentos,
        precio_neto,
        utilidad,
        precio_venta,
        maneja_stock,
        nota,
        familia_id,
        categoria_id,
        clasificacion_id,
        codigo,
        centro_costo_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        descripcion,
        Number(precio) || 0,
        iva_id || null,
        JSON.stringify(descuentos),
        Number(precio_neto) || 0,
        Number(utilidad) || 0,
        Number(precio_venta) || 0,
        maneja_stock ? 1 : 0,
        nota || null,
        familia_id || null,
        categoria_id || null,
        clasificacion_id || null,
        codigo || null,
        centro_costo_id || null
      ]
    );

    return NextResponse.json(
      { message: "Artículo creado", id: res.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /articulos error:", error);
    return NextResponse.json({ error: "Error al crear artículo" }, { status: 500 });
  }
}
