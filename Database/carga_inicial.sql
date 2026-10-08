-- Carga inicial de datos para EPA_USER1.
-- Ejecutar con SQL Developer usando Run Script (F5).
-- Genera: 8 sucursales, 10 categorias, 16 empleados, 100 clientes,
-- 200 productos, 1,600 filas de inventario, 100 ventas,
-- 200 detalles y movimientos de inventario iniciales y por venta.
-- Los IDs empiezan despues del MAX actual para evitar colisiones.

SET SERVEROUTPUT ON;

DECLARE
  TYPE t_textos IS TABLE OF VARCHAR2(4000) INDEX BY PLS_INTEGER;
  TYPE t_precios IS TABLE OF NUMBER INDEX BY PLS_INTEGER;

  c_sucursales CONSTANT PLS_INTEGER := 8;
  c_categorias CONSTANT PLS_INTEGER := 10;
  c_empleados CONSTANT PLS_INTEGER := 16;
  c_clientes CONSTANT PLS_INTEGER := 100;
  c_productos CONSTANT PLS_INTEGER := 200;
  c_ventas CONSTANT PLS_INTEGER := 100;
  c_detalles CONSTANT PLS_INTEGER := c_ventas * 2;
  c_inventarios CONSTANT PLS_INTEGER := c_sucursales * c_productos;
  c_movimientos CONSTANT PLS_INTEGER := c_inventarios + c_detalles;

  v_sucursal_inicio NUMBER;
  v_categoria_inicio NUMBER;
  v_empleado_inicio NUMBER;
  v_cliente_inicio NUMBER;
  v_producto_inicio NUMBER;
  v_inventario_inicio NUMBER;
  v_venta_inicio NUMBER;
  v_detalle_inicio NUMBER;
  v_movimiento_inicio NUMBER;
  v_movimiento_actual NUMBER;

  v_sucursal_indice PLS_INTEGER;
  v_producto_a PLS_INTEGER;
  v_producto_b PLS_INTEGER;
  v_inventario_a NUMBER;
  v_inventario_b NUMBER;
  v_cantidad_a NUMBER;
  v_cantidad_b NUMBER;
  v_precio_a NUMBER(10, 2);
  v_precio_b NUMBER(10, 2);
  v_total NUMBER(10, 2);
  v_stock NUMBER;
  v_categoria_indice PLS_INTEGER;
  v_producto_variante PLS_INTEGER;
  v_nombre_producto VARCHAR2(70);
  v_direccion_cliente VARCHAR2(60);
  v_nombres t_textos;
  v_apellidos t_textos;
  v_sucursales t_textos;
  v_direcciones_sucursal t_textos;
  v_telefonos_sucursal t_textos;
  v_direcciones_cliente t_textos;
  v_categorias t_textos;
  v_descripciones_categoria t_textos;
  v_catalogos t_textos;
  v_precios_base t_precios;
BEGIN
  SELECT NVL(MAX(ID_SUCURSAL), 0) INTO v_sucursal_inicio FROM TB_SUCURSAL;
  SELECT NVL(MAX(ID_CATEGORIA), 0) INTO v_categoria_inicio FROM TB_CATEGORIA_PRODUCTO;
  SELECT NVL(MAX(ID_EMPLEADO), 0) INTO v_empleado_inicio FROM TB_EMPLEADO;
  SELECT NVL(MAX(ID_CLIENTE), 0) INTO v_cliente_inicio FROM TB_CLIENTE;
  SELECT NVL(MAX(ID_PRODUCTO), 0) INTO v_producto_inicio FROM TB_PRODUCTO;
  SELECT NVL(MAX(ID_INVENTARIO), 0) INTO v_inventario_inicio FROM TB_INVENTARIO;
  SELECT NVL(MAX(ID_VENTA), 0) INTO v_venta_inicio FROM TB_ENCABEZADO_VENTA;
  SELECT NVL(MAX(ID_DETALLE), 0) INTO v_detalle_inicio FROM TB_DETALLE_VENTA;
  SELECT NVL(MAX(ID_MOVIMIENTO), 0) INTO v_movimiento_inicio FROM MOVIMIENTO_INVENTARIO;

  IF v_sucursal_inicio + c_sucursales > 99999
    OR v_categoria_inicio + c_categorias > 99999
    OR v_empleado_inicio + c_empleados > 99999
    OR v_cliente_inicio + c_clientes > 99999
    OR v_producto_inicio + c_productos > 99999
    OR v_inventario_inicio + c_inventarios > 99999
    OR v_venta_inicio + c_ventas > 99999
    OR v_detalle_inicio + c_detalles > 99999
    OR v_movimiento_inicio + c_movimientos > 99999 THEN
    RAISE_APPLICATION_ERROR(-20001, 'La carga excede el limite de IDs NUMBER(5).');
  END IF;

  -- Datos y ubicaciones ficticias con formatos plausibles de Guatemala.
  v_sucursales(1) := 'Ferreteria El Volcan - Guatemala Zona 1';
  v_sucursales(2) := 'Ferreteria El Volcan - Guatemala Zona 7';
  v_sucursales(3) := 'Ferreteria El Volcan - Mixco';
  v_sucursales(4) := 'Ferreteria El Volcan - Villa Nueva';
  v_sucursales(5) := 'Ferreteria El Volcan - Quetzaltenango';
  v_sucursales(6) := 'Ferreteria El Volcan - Antigua Guatemala';
  v_sucursales(7) := 'Ferreteria El Volcan - Escuintla';
  v_sucursales(8) := 'Ferreteria El Volcan - Chimaltenango';

  v_direcciones_sucursal(1) := '6a avenida 4-18, zona 1, Ciudad de Guatemala';
  v_direcciones_sucursal(2) := 'Calzada San Juan 2-45, zona 7, Ciudad de Guatemala';
  v_direcciones_sucursal(3) := 'Boulevard El Caminero 8-20, zona 6, Mixco';
  v_direcciones_sucursal(4) := 'Avenida El Frutal 3-12, zona 5, Villa Nueva';
  v_direcciones_sucursal(5) := 'Avenida Las Americas 3-12, zona 3, Quetzaltenango';
  v_direcciones_sucursal(6) := 'Calle del Arco 5-22, zona 1, Antigua Guatemala';
  v_direcciones_sucursal(7) := '5a avenida 2-18, zona 1, Escuintla';
  v_direcciones_sucursal(8) := '5a avenida 1-15, zona 2, Chimaltenango';

  v_telefonos_sucursal(1) := '50255501001';
  v_telefonos_sucursal(2) := '50255501002';
  v_telefonos_sucursal(3) := '50255501003';
  v_telefonos_sucursal(4) := '50255501004';
  v_telefonos_sucursal(5) := '50255501005';
  v_telefonos_sucursal(6) := '50255501006';
  v_telefonos_sucursal(7) := '50255501007';
  v_telefonos_sucursal(8) := '50255501008';

  v_direcciones_cliente(1) := 'Residenciales Los Pinos, zona 1, Ciudad de Guatemala';
  v_direcciones_cliente(2) := 'Colonia El Esfuerzo, zona 7, Ciudad de Guatemala';
  v_direcciones_cliente(3) := 'Colonia Nueva Montserrat, zona 3, Mixco';
  v_direcciones_cliente(4) := 'Residenciales Valle Verde, zona 5, Villa Nueva';
  v_direcciones_cliente(5) := 'Colonia La Floresta, zona 3, Quetzaltenango';
  v_direcciones_cliente(6) := 'Barrio San Pedro, zona 1, Antigua Guatemala';
  v_direcciones_cliente(7) := 'Colonia Palmeras del Sur, zona 1, Escuintla';
  v_direcciones_cliente(8) := 'Colonia La Alameda, zona 2, Chimaltenango';

  v_nombres(1) := 'Ana Lucia';
  v_nombres(2) := 'Maria Fernanda';
  v_nombres(3) := 'Carlos';
  v_nombres(4) := 'Jose Manuel';
  v_nombres(5) := 'Luisa';
  v_nombres(6) := 'Diego';
  v_nombres(7) := 'Paula';
  v_nombres(8) := 'Ricardo';
  v_nombres(9) := 'Carmen';
  v_nombres(10) := 'Oscar';
  v_nombres(11) := 'Sofia';
  v_nombres(12) := 'Juan Pablo';
  v_nombres(13) := 'Andrea';
  v_nombres(14) := 'Jorge';
  v_nombres(15) := 'Gabriela';
  v_nombres(16) := 'Fernando';
  v_nombres(17) := 'Elena';
  v_nombres(18) := 'Mateo';
  v_nombres(19) := 'Rosa';
  v_nombres(20) := 'Victor';

  v_apellidos(1) := 'Lopez';
  v_apellidos(2) := 'Garcia';
  v_apellidos(3) := 'de Leon';
  v_apellidos(4) := 'Castillo';
  v_apellidos(5) := 'Mendez';

  v_categorias(1) := 'Herramientas manuales';
  v_categorias(2) := 'Herramientas electricas';
  v_categorias(3) := 'Plomeria y drenajes';
  v_categorias(4) := 'Electricidad e iluminacion';
  v_categorias(5) := 'Tornilleria y fijaciones';
  v_categorias(6) := 'Pinturas y acabados';
  v_categorias(7) := 'Materiales de construccion';
  v_categorias(8) := 'Seguridad industrial';
  v_categorias(9) := 'Jardineria y exterior';
  v_categorias(10) := 'Cerraduras y herrajes';

  v_descripciones_categoria(1) := 'Herramientas para carpinteria, reparacion y trabajo general.';
  v_descripciones_categoria(2) := 'Equipo electrico para construccion y mantenimiento.';
  v_descripciones_categoria(3) := 'Tuberia, conexiones y accesorios para agua y drenaje.';
  v_descripciones_categoria(4) := 'Cableado, proteccion electrica e iluminacion.';
  v_descripciones_categoria(5) := 'Tornillos, pernos, anclajes y elementos de fijacion.';
  v_descripciones_categoria(6) := 'Pinturas, selladores y productos para acabados.';
  v_descripciones_categoria(7) := 'Materiales basicos para obra gris y construccion.';
  v_descripciones_categoria(8) := 'Equipo de proteccion personal para trabajo y obra.';
  v_descripciones_categoria(9) := 'Herramientas y suministros para jardin y exterior.';
  v_descripciones_categoria(10) := 'Cerraduras, candados y accesorios para puertas.';

  v_precios_base(1) := 18;
  v_precios_base(2) := 280;
  v_precios_base(3) := 8;
  v_precios_base(4) := 12;
  v_precios_base(5) := 1;
  v_precios_base(6) := 45;
  v_precios_base(7) := 8;
  v_precios_base(8) := 16;
  v_precios_base(9) := 25;
  v_precios_base(10) := 30;

  v_catalogos(1) := 'Martillo de carpintero 16 oz|Martillo de bola 24 oz|Alicate universal 8 pulg|Alicate de punta 6 pulg|Llave ajustable 10 pulg|Llave Stilson 14 pulg|Destornillador plano 1/4 pulg|Destornillador Phillips #2|Cinta metrica 5 m|Nivel de aluminio 24 pulg|Serrucho para madera 20 pulg|Formon para madera 1 pulg|Arco para segueta 12 pulg|Lima plana 10 pulg|Prensa tipo C 4 pulg|Escuadra metalica 12 pulg|Cincel frio 3/4 pulg|Cutter retractil reforzado|Juego de llaves Allen 10 pzas|Pinza de presion 10 pulg';
  v_catalogos(2) := 'Taladro percutor 1/2 pulg 650 W|Esmeril angular 4-1/2 pulg 850 W|Sierra circular 7-1/4 pulg 1400 W|Rotomartillo SDS 800 W|Pulidora angular 7 pulg|Caladora electrica 650 W|Lijadora orbital 300 W|Atornillador electrico 280 W|Sierra caladora 500 W|Soldadora inverter 160 A|Compresor de aire 24 L|Hidrolavadora 1600 PSI|Mezcladora para pintura 600 W|Router para madera 1200 W|Cepillo electrico 3-1/4 pulg|Bomba de agua periferica 1/2 HP|Generador electrico 2500 W|Extensor electrico industrial 15 m|Juego de brocas para concreto 8 pzas|Disco para corte metal 4-1/2 pulg';
  v_catalogos(3) := 'Tubo PVC agua 1/2 pulg 6 m|Tubo PVC agua 3/4 pulg 6 m|Tubo PVC agua 1 pulg 6 m|Tubo PVC drenaje 2 pulg 6 m|Tubo PVC drenaje 4 pulg 6 m|Codo PVC agua 1/2 pulg|Codo PVC agua 3/4 pulg|Tee PVC agua 1/2 pulg|Adaptador macho PVC 1/2 pulg|Adaptador hembra PVC 1/2 pulg|Union PVC agua 3/4 pulg|Valvula de paso PVC 1/2 pulg|Pegamento PVC azul 1/4 gal|Cinta teflon 1/2 pulg|Sifon plastico para lavatrastos|Llave de chorro metalica 1/2 pulg|Regadera cromada ahorradora|Manguera flexible para lavamanos|Flotador para tanque de agua|Rejilla de drenaje 4 pulg';
  v_catalogos(4) := 'Cable THHN calibre 12 rollo 100 m|Cable THHN calibre 14 rollo 100 m|Cable THHN calibre 10 rollo 100 m|Cable duplex calibre 16 rollo 100 m|Tomacorriente doble polarizado|Interruptor sencillo blanco|Interruptor doble blanco|Placa para tomacorriente doble|Caja rectangular galvanizada|Caja octagonal galvanizada|Flipon 1 polo 20 A|Flipon 2 polos 30 A|Tablero electrico 8 circuitos|Conector para tubo conduit 1/2 pulg|Tubo conduit PVC 1/2 pulg 3 m|Bombillo LED luz blanca 12 W|Lampara LED para techo 18 W|Reflector LED exterior 50 W|Extension electrica uso rudo 10 m|Cinta aislante electrica 20 m';
  v_catalogos(5) := 'Tornillo gypsum 1 pulg caja 100|Tornillo gypsum 1-1/4 pulg caja 100|Tornillo para madera 1 pulg caja 100|Tornillo para madera 2 pulg caja 100|Tornillo punta broca 1/2 pulg caja 100|Tornillo hexagonal 1/4 x 2 pulg|Perno coche 1/4 x 2 pulg|Perno galvanizado 3/8 x 3 pulg|Tuerca hexagonal 1/4 pulg caja 50|Arandela plana 1/4 pulg caja 50|Clavo para madera 2 pulg libra|Clavo para madera 3 pulg libra|Clavo para concreto 2 pulg libra|Anclaje expansivo 3/8 x 3 pulg|Tarugo plastico 1/4 pulg paquete 50|Varilla roscada 3/8 pulg x 1 m|Abrazadera metalica 1 pulg|Remache pop 1/8 pulg caja 100|Bisagra galvanizada 3 pulg par|Alambre galvanizado calibre 16 libra';
  v_catalogos(6) := 'Pintura latex interior blanco galon|Pintura latex exterior blanco galon|Pintura esmalte negro galon|Pintura esmalte blanco cuarto|Primer anticorrosivo rojo galon|Sellador para pared galon|Impermeabilizante para techo galon|Barniz transparente para madera galon|Thinner corriente galon|Aguarras mineral galon|Masilla para pared cubeta 1 gal|Pasta para tablayeso cubeta 1 gal|Brocha economica 2 pulg|Brocha profesional 4 pulg|Rodillo para pintar 9 pulg|Felpa para rodillo 9 pulg|Bandeja plastica para pintura|Lija para madera grano 120 paquete|Lija para metal grano 80 paquete|Espatula metalica para masilla 4 pulg';
  v_catalogos(7) := 'Cemento gris saco 42.5 kg|Cal hidratada saco 20 kg|Arena cernida saco 40 kg|Piedrin triturado saco 40 kg|Block de concreto 14 x 19 x 39 cm|Block de concreto 19 x 19 x 39 cm|Ladrillo tayuyo unidad|Varilla corrugada 3/8 pulg x 6 m|Varilla corrugada 1/2 pulg x 6 m|Alambre de amarre libra|Malla electrosoldada panel 2 x 6 m|Lamina galvanizada 8 pies|Lamina troquelada 10 pies|Tabla de pino 1 x 8 x 10 pies|Regla de pino 2 x 3 x 10 pies|Plywood de pino 1/2 pulg 4 x 8 pies|Panel de tablayeso 1/2 pulg|Canal metalico para tablayeso 3 m|Adhesivo ceramico saco 20 kg|Boquilla para ceramica bolsa 2 kg';
  v_catalogos(8) := 'Guantes de cuero para obra par|Guantes de nitrilo recubiertos par|Casco de seguridad blanco|Lentes claros de seguridad|Lentes oscuros de seguridad|Chaleco reflectivo talla grande|Bota industrial punta de acero par|Mascarilla para polvo paquete 10|Respirador reutilizable media cara|Filtro para respirador par|Protector auditivo tipo copa|Tapones auditivos paquete 10|Arnes de seguridad cuerpo completo|Linea de vida doble con ganchos|Faja lumbar reforzada|Impermeable de trabajo talla grande|Careta para soldar fotosensible|Guantes para soldador par|Botiquin de primeros auxilios|Cono vial reflectivo 70 cm';
  v_catalogos(9) := 'Manguera de jardin 1/2 pulg rollo 25 m|Manguera de jardin 3/4 pulg rollo 25 m|Aspersor plastico giratorio|Pistola para riego 7 funciones|Pala cuadrada mango de madera|Pala redonda mango de madera|Azadon con mango de madera|Machete de 22 pulg|Rastrillo metalico 14 dientes|Tijera para podar manual|Serrucho para poda 12 pulg|Carretilla de obra una rueda|Bomba manual para fumigar 16 L|Regadera plastica 10 L|Maceta plastica mediana|Escoba plastica para patio|Piocha con mango|Hacha de mano 1.5 lb|Cuerda polipropileno 10 mm rollo 20 m|Lona impermeable 3 x 4 m';
  v_catalogos(10) := 'Candado laminado 40 mm|Candado laminado 50 mm|Candado para intemperie 60 mm|Cerradura de pomo para dormitorio|Cerradura de pomo para baño|Cerradura manija para entrada|Cerradura de sobreponer derecha|Cerrojo pasador para puerta|Pasador metalico 4 pulg|Bisagra piano 1 m|Bisagra galvanizada 3 pulg par|Bisagra tipo libro 4 pulg par|Jalador metalico para puerta|Tope de puerta de piso|Mirilla gran angular para puerta|Chapa auxiliar de seguridad|Manija para porton metalico|Riel para porton corredizo 2 m|Rueda para porton corredizo 3 pulg|Kit de accesorios para puerta corrediza';

  -- Sucursales
  FOR i IN 1..c_sucursales LOOP
    INSERT INTO TB_SUCURSAL (ID_SUCURSAL, NOMBRE, DIRECCION, TELEFONO)
    VALUES (
      v_sucursal_inicio + i,
      v_sucursales(i),
      v_direcciones_sucursal(i),
      v_telefonos_sucursal(i)
    );
  END LOOP;

  -- Categorias
  FOR i IN 1..c_categorias LOOP
    INSERT INTO TB_CATEGORIA_PRODUCTO (ID_CATEGORIA, NOMBRE_CATEGORIA, DESCRIPCION)
    VALUES (
      v_categoria_inicio + i,
      v_categorias(i),
      v_descripciones_categoria(i)
    );
  END LOOP;

  -- Empleados: dos por sucursal. La columna fisica se llama PUSTO en Oracle.
  FOR i IN 1..c_empleados LOOP
    v_sucursal_indice := MOD(i - 1, c_sucursales) + 1;
    INSERT INTO TB_EMPLEADO (
      ID_EMPLEADO, ID_SUCURSAL, NOMBRE, PUSTO, FECHA_INGRESO
    ) VALUES (
      v_empleado_inicio + i,
      v_sucursal_inicio + v_sucursal_indice,
      v_nombres(MOD(i - 1, 20) + 1) || ' ' || v_apellidos(MOD(i - 1, 5) + 1),
      CASE WHEN i <= c_sucursales THEN 'Encargado de sucursal' ELSE 'Asesor de ventas' END,
      TRUNC(SYSDATE) - (i * 30)
    );
  END LOOP;

  -- Clientes ficticios; DPI y NIT son identificadores sinteticos, no reales.
  FOR i IN 1..c_clientes LOOP
    v_sucursal_indice := MOD(i - 1, c_sucursales) + 1;
    v_direccion_cliente := v_direcciones_cliente(v_sucursal_indice);
    INSERT INTO TB_CLIENTE (
      ID_CLIENTE, ID_SUCURSAL, DPI, NIT, NOMBRE, DIRECCION, TELEFONO, CORREO
    ) VALUES (
      v_cliente_inicio + i,
      v_sucursal_inicio + v_sucursal_indice,
      TO_CHAR(9000000000000 + v_cliente_inicio + i, 'FM0000000000000'),
      TO_CHAR(900000000000000 + v_cliente_inicio + i, 'FM000000000000000'),
      v_nombres(MOD(i - 1, 20) + 1) || ' ' || v_apellidos(TRUNC((i - 1) / 20) + 1),
      v_direccion_cliente,
      TO_CHAR(50255500000 + v_cliente_inicio + i, 'FM00000000000'),
      'cliente' || TO_CHAR(v_cliente_inicio + i, 'FM00000') || '@ejemplo.test'
    );
  END LOOP;

  -- Catalogo ferretero: 20 productos realistas por categoria; precios en GTQ.
  FOR i IN 1..c_productos LOOP
    v_categoria_indice := TRUNC((i - 1) / 20) + 1;
    v_producto_variante := MOD(i - 1, 20) + 1;
    v_nombre_producto := REGEXP_SUBSTR(
      v_catalogos(v_categoria_indice), '[^|]+', 1, v_producto_variante
    );
    INSERT INTO TB_PRODUCTO (
      ID_PRODUCTO, ID_CATEGORIA, NOMBRE, DESCRIPCION, PRECIO_UNITARIO, ESTADO
    ) VALUES (
      v_producto_inicio + i,
      v_categoria_inicio + v_categoria_indice,
      v_nombre_producto,
      'Articulo para ferreteria y mantenimiento: ' || v_categorias(v_categoria_indice) || '.',
      ROUND(v_precios_base(v_categoria_indice) + MOD(i * 37, 300) / 10, 2),
      'ACTIVO'
    );
  END LOOP;

  -- Inventario: cada producto queda disponible en cada sucursal.
  -- Se registra tambien el movimiento de entrada que origina el stock.
  v_movimiento_actual := v_movimiento_inicio;
  FOR sucursal_indice IN 1..c_sucursales LOOP
    FOR producto_indice IN 1..c_productos LOOP
      v_stock := 100 + MOD(producto_indice * 3 + sucursal_indice, 500);
      INSERT INTO TB_INVENTARIO (
        ID_INVENTARIO, ID_SUCURSAL, ID_PRODUCTO, STOCK, STOCK_MINIMO, FECHA_ACTUALIZACION
      ) VALUES (
        v_inventario_inicio + (sucursal_indice - 1) * c_productos + producto_indice,
        v_sucursal_inicio + sucursal_indice,
        v_producto_inicio + producto_indice,
        v_stock,
        5 + MOD(producto_indice, 20),
        TRUNC(SYSDATE)
      );

      v_movimiento_actual := v_movimiento_actual + 1;
      INSERT INTO MOVIMIENTO_INVENTARIO (
        ID_MOVIMIENTO, ID_SUCURSAL, ID_PRODUCTO, TIPO_MOVIMIENTO,
        CANTIDAD, FECHA_MOVIMIENTO, OBSERVACION
      ) VALUES (
        v_movimiento_actual,
        v_sucursal_inicio + sucursal_indice,
        v_producto_inicio + producto_indice,
        'CARGA INICIAL',
        v_stock,
        TRUNC(SYSDATE),
        'Entrada inicial de inventario.'
      );
    END LOOP;
  END LOOP;

  -- Ventas con dos productos por venta; el stock y sus movimientos se actualizan.
  FOR i IN 1..c_ventas LOOP
    v_sucursal_indice := MOD(i - 1, c_sucursales) + 1;
    v_producto_a := MOD((i - 1) * 2, c_productos) + 1;
    v_producto_b := MOD((i - 1) * 2 + 1, c_productos) + 1;
    v_cantidad_a := MOD(i, 4) + 1;
    v_cantidad_b := MOD(i + 1, 4) + 1;
    SELECT PRECIO_UNITARIO INTO v_precio_a
    FROM TB_PRODUCTO
    WHERE ID_PRODUCTO = v_producto_inicio + v_producto_a;
    SELECT PRECIO_UNITARIO INTO v_precio_b
    FROM TB_PRODUCTO
    WHERE ID_PRODUCTO = v_producto_inicio + v_producto_b;
    v_total := v_cantidad_a * v_precio_a + v_cantidad_b * v_precio_b;
    v_inventario_a := v_inventario_inicio + (v_sucursal_indice - 1) * c_productos + v_producto_a;
    v_inventario_b := v_inventario_inicio + (v_sucursal_indice - 1) * c_productos + v_producto_b;

    INSERT INTO TB_ENCABEZADO_VENTA (
      ID_VENTA, ID_CLIENTE, ID_SUCURSAL, ID_EMPLEADO,
      FECHA_VENTA, TOTAL_VENTA, ESTADO
    ) VALUES (
      v_venta_inicio + i,
      v_cliente_inicio + i,
      v_sucursal_inicio + v_sucursal_indice,
      v_empleado_inicio + v_sucursal_indice + MOD(i - 1, 2) * c_sucursales,
      TRUNC(SYSDATE) - MOD(i, 60),
      v_total,
      'PAGADA'
    );

    INSERT INTO TB_DETALLE_VENTA (
      ID_DETALLE, ID_VENTA, ID_INVENTARIO, CANTIDAD, PRECIO_UNITARIO, SUBTOTAL
    ) VALUES (
      v_detalle_inicio + (i - 1) * 2 + 1,
      v_venta_inicio + i,
      v_inventario_a,
      v_cantidad_a,
      v_precio_a,
      v_cantidad_a * v_precio_a
    );
    INSERT INTO TB_DETALLE_VENTA (
      ID_DETALLE, ID_VENTA, ID_INVENTARIO, CANTIDAD, PRECIO_UNITARIO, SUBTOTAL
    ) VALUES (
      v_detalle_inicio + (i - 1) * 2 + 2,
      v_venta_inicio + i,
      v_inventario_b,
      v_cantidad_b,
      v_precio_b,
      v_cantidad_b * v_precio_b
    );

    UPDATE TB_INVENTARIO
    SET STOCK = STOCK - v_cantidad_a, FECHA_ACTUALIZACION = TRUNC(SYSDATE)
    WHERE ID_INVENTARIO = v_inventario_a;
    UPDATE TB_INVENTARIO
    SET STOCK = STOCK - v_cantidad_b, FECHA_ACTUALIZACION = TRUNC(SYSDATE)
    WHERE ID_INVENTARIO = v_inventario_b;

    v_movimiento_actual := v_movimiento_actual + 1;
    INSERT INTO MOVIMIENTO_INVENTARIO (
      ID_MOVIMIENTO, ID_SUCURSAL, ID_PRODUCTO, TIPO_MOVIMIENTO,
      CANTIDAD, FECHA_MOVIMIENTO, OBSERVACION
    ) VALUES (
      v_movimiento_actual,
      v_sucursal_inicio + v_sucursal_indice,
      v_producto_inicio + v_producto_a,
      'SALIDA VENTA',
      v_cantidad_a,
      TRUNC(SYSDATE) - MOD(i, 60),
      'Salida por venta ' || TO_CHAR(v_venta_inicio + i, 'FM00000')
    );

    v_movimiento_actual := v_movimiento_actual + 1;
    INSERT INTO MOVIMIENTO_INVENTARIO (
      ID_MOVIMIENTO, ID_SUCURSAL, ID_PRODUCTO, TIPO_MOVIMIENTO,
      CANTIDAD, FECHA_MOVIMIENTO, OBSERVACION
    ) VALUES (
      v_movimiento_actual,
      v_sucursal_inicio + v_sucursal_indice,
      v_producto_inicio + v_producto_b,
      'SALIDA VENTA',
      v_cantidad_b,
      TRUNC(SYSDATE) - MOD(i, 60),
      'Salida por venta ' || TO_CHAR(v_venta_inicio + i, 'FM00000')
    );
  END LOOP;

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Carga inicial completada correctamente.');
  DBMS_OUTPUT.PUT_LINE('Sucursales: ' || c_sucursales || ', clientes: ' || c_clientes || ', productos: ' || c_productos || '.');
  DBMS_OUTPUT.PUT_LINE('Incluye categorias, empleados, inventario, ventas, detalles y movimientos.');
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;
/
