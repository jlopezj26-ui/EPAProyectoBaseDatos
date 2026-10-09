-- PROYECTO BASE DE DATOS I - FERRETERÍAS EPA
-- INTEGRANTE 2 (DML Y PL/SQL)

SET SERVEROUTPUT ON;

-- -----------------------------------------------------------------------------
-- 1. CARGA DE SUCURSALES (8 Sucursales)
-- -----------------------------------------------------------------------------
INSERT INTO tb_sucursal (id_sucursal, nombre, direccion, telefono) VALUES (1, 'EPA Plaza Maderas', 'Calzada Roosevelt 22-00 Zona 11, Guatemala', '2300-1100');
INSERT INTO tb_sucursal (id_sucursal, nombre, direccion, telefono) VALUES (2, 'EPA Carretera a El Salvador', 'Km 16.5 Carretera a El Salvador, Fraijanes', '2300-1200');
INSERT INTO tb_sucursal (id_sucursal, nombre, direccion, telefono) VALUES (3, 'EPA Portales', 'Km 4.5 Carretera al Atlántico Zona 17, Guatemala', '2300-1300');
INSERT INTO tb_sucursal (id_sucursal, nombre, direccion, telefono) VALUES (4, 'EPA Quetzaltenango', 'Avenida Las Américas 7-12 Zona 3, Quetzaltenango', '7700-1400');
INSERT INTO tb_sucursal (id_sucursal, nombre, direccion, telefono) VALUES (5, 'EPA Chimaltenango', 'Km 54.5 Carretera Interamericana, Chimaltenango', '7800-1500');
INSERT INTO tb_sucursal (id_sucursal, nombre, direccion, telefono) VALUES (6, 'EPA San Cristóbal', 'Bulevar San Cristóbal 12-40 Zona 8 de Mixco', '2300-1600');
INSERT INTO tb_sucursal (id_sucursal, nombre, direccion, telefono) VALUES (7, 'EPA Escuintla', 'Km 58 Carretera a Puerto Quetzal, Escuintla', '7900-1700');
INSERT INTO tb_sucursal (id_sucursal, nombre, direccion, telefono) VALUES (8, 'EPA Cobán', '1a Calle 4-15 Zona 2, Cobán, Alta Verapaz', '7950-1800');

-- -----------------------------------------------------------------------------
-- 2. CARGA DE CATEGORÍAS DE PRODUCTOS (5 Categorías)
-- -----------------------------------------------------------------------------
INSERT INTO tb_categoria_producto (id_categoria, nombre_categoria, descripcion) VALUES (1, 'Herramientas', 'Herramientas manuales y eléctricas para construcción y taller');
INSERT INTO tb_categoria_producto (id_categoria, nombre_categoria, descripcion) VALUES (2, 'Construcción', 'Materiales obra gruesa, cementos, hierro y acabados');
INSERT INTO tb_categoria_producto (id_categoria, nombre_categoria, descripcion) VALUES (3, 'Pintura', 'Pinturas de agua, aceite, impermeabilizantes y accesorios');
INSERT INTO tb_categoria_producto (id_categoria, nombre_categoria, descripcion) VALUES (4, 'Electricidad', 'Cables, iluminación, tomacorrientes y tableros eléctricos');
INSERT INTO tb_categoria_producto (id_categoria, nombre_categoria, descripcion) VALUES (5, 'Plomería', 'Tuberías PVC, grifería, conexiones y accesorios sanitarios');

-- -----------------------------------------------------------------------------
-- 3. CARGA DE EMPLEADOS (8 Empleados - 1 por sucursal)
-- -----------------------------------------------------------------------------
INSERT INTO tb_empleado (id_empleado, id_sucursal, nombre, pusto, fecha_ingreso) VALUES (1, 1, 'Carlos Gómez', 'Cajero Principal', TO_DATE('2022-01-15', 'YYYY-MM-DD'));
INSERT INTO tb_empleado (id_empleado, id_sucursal, nombre, pusto, fecha_ingreso) VALUES (2, 2, 'Ana Martínez', 'Cajera', TO_DATE('2022-03-10', 'YYYY-MM-DD'));
INSERT INTO tb_empleado (id_empleado, id_sucursal, nombre, pusto, fecha_ingreso) VALUES (3, 3, 'Luis Hernández', 'Cajero', TO_DATE('2021-11-20', 'YYYY-MM-DD'));
INSERT INTO tb_empleado (id_empleado, id_sucursal, nombre, pusto, fecha_ingreso) VALUES (4, 4, 'María Rodríguez', 'Cajera Encargada', TO_DATE('2023-02-01', 'YYYY-MM-DD'));
INSERT INTO tb_empleado (id_empleado, id_sucursal, nombre, pusto, fecha_ingreso) VALUES (5, 5, 'Pedro López', 'Cajero', TO_DATE('2022-08-15', 'YYYY-MM-DD'));
INSERT INTO tb_empleado (id_empleado, id_sucursal, nombre, pusto, fecha_ingreso) VALUES (6, 6, 'Sofia Morales', 'Cajera', TO_DATE('2023-05-12', 'YYYY-MM-DD'));
INSERT INTO tb_empleado (id_empleado, id_sucursal, nombre, pusto, fecha_ingreso) VALUES (7, 7, 'Jorge Pérez', 'Cajero', TO_DATE('2021-06-30', 'YYYY-MM-DD'));
INSERT INTO tb_empleado (id_empleado, id_sucursal, nombre, pusto, fecha_ingreso) VALUES (8, 8, 'Lucía Alvarez', 'Cajera', TO_DATE('2022-09-01', 'YYYY-MM-DD'));

-- -----------------------------------------------------------------------------
-- 4. CARGA MASIVA DE 100 CLIENTES (Bloque Anónimo PL/SQL)
-- -----------------------------------------------------------------------------
DECLARE
    v_dpi VARCHAR2(13);
    v_nit VARCHAR2(15);
    v_sucursal NUMBER(5);
BEGIN
    FOR i IN 1..100 LOOP
        v_dpi := TO_CHAR(2000000000000 + i);
        v_nit := TO_CHAR(1000000 + i) || '-' || TO_CHAR(MOD(i, 9));
        v_sucursal := MOD(i, 8) + 1; -- Asigna proporcionalmente sucursales del 1 al 8
        
        INSERT INTO tb_cliente (
            id_cliente, id_sucursal, dpi, nit, nombre, direccion, telefono, correo
        ) VALUES (
            i,
            v_sucursal,
            v_dpi,
            v_nit,
            'Cliente EPA ' || i,
            'Calle ' || (MOD(i, 20) + 1) || ' Av. ' || (MOD(i, 10) + 1) || ' Z.' || (MOD(i, 15) + 1),
            '5' || LPAD(TO_CHAR(i), 7, '0'),
            'cliente' || i || '@correo.com'
        );
    END LOOP;
END;
/

-- -----------------------------------------------------------------------------
-- 5. CARGA MASIVA DE 200 PRODUCTOS (Bloque Anónimo PL/SQL)
-- -----------------------------------------------------------------------------
DECLARE
    v_cat NUMBER(5);
    v_precio NUMBER(10,2);
    v_nom VARCHAR2(70);
BEGIN
    FOR i IN 1..200 LOOP
        -- Distribuir en las 5 categorías
        IF i <= 40 THEN 
            v_cat := 1; v_precio := 25.00 + (i * 1.5); v_nom := 'Herramienta Art. ' || i;
        ELSIF i <= 80 THEN 
            v_cat := 2; v_precio := 85.00 + (i * 2.1); v_nom := 'Material Construccion ' || i;
        ELSIF i <= 120 THEN 
            v_cat := 3; v_precio := 45.00 + (i * 1.8); v_nom := 'Pintura Especial ' || i;
        ELSIF i <= 160 THEN 
            v_cat := 4; v_precio := 15.00 + (i * 0.9); v_nom := 'Equipo Eléctrico ' || i;
        ELSE 
            v_cat := 5; v_precio := 30.00 + (i * 1.2); v_nom := 'Accesorio Plomería ' || i;
        END IF;

        INSERT INTO tb_producto (
            id_producto, id_categoria, nombre, descripcion, precio_unitario, estado
        ) VALUES (
            i,
            v_cat,
            v_nom,
            'Descripción del producto ' || i || ' para ferretería',
            ROUND(v_precio, 2),
            'ACTIVO'
        );
    END LOOP;
END;
/

-- -----------------------------------------------------------------------------
-- 6. CARGA DE INVENTARIO INICIAL (200 Productos x 8 Sucursales = 1,600 Registros)
-- -----------------------------------------------------------------------------
DECLARE
    v_id_inv NUMBER(5) := 1;
BEGIN
    FOR s IN 1..8 LOOP
        FOR p IN 1..200 LOOP
            INSERT INTO tb_inventario (
                id_inventario, id_sucursal, id_producto, stock, stock_minimo, fecha_actualizacion
            ) VALUES (
                v_id_inv,
                s,
                p,
                100, -- Stock inicial de 100 unidades por sucursal
                10,  -- Stock mínimo de alerta
                SYSDATE
            );
            v_id_inv := v_id_inv + 1;
        END LOOP;
    END LOOP;
END;
/

COMMIT;