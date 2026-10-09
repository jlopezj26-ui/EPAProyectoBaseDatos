--PRUEBAS DE CONCURRENCIA Y CRASH TEST
SET SERVEROUTPUT ON;


--PRUEBA 1: SIMULACIÓN DE CONCURRENCIA (FOR UPDATE)
--Objetivo: Verifica que dos cajeros no vendan el mismo producto al mismo tiempo si no hay stock suficiente, bloqueando el registro para evitar sobreventas o inventarios negativos.

-- Paso 1: Ajustar stock del Producto 1 en Sucursal 1 a solo 1 unidad
UPDATE TB_INVENTARIO 
SET STOCK = 1 
WHERE ID_SUCURSAL = 1 
AND ID_PRODUCTO = 1;
COMMIT;

--Nota: vamos a crear dos terminales. sesion A y sesion B.
-- Paso 2 (Sesión A / Terminal 1): Bloquear la fila intencionalmente
SELECT STOCK 
FROM TB_INVENTARIO 
WHERE ID_SUCURSAL = 1 
AND ID_PRODUCTO = 1 
FOR UPDATE;

-- Paso 3 (Sesión B / Terminal 2): Intentar vender la única unidad al mismo tiempo
BEGIN
     SP_CREAR_FACTURA(p_id_cliente => 1, p_id_sucursal => 1, p_id_empleado => 1, p_id_producto => 1, p_cantidad => 1);
 END;
/
--Nota: La Sesión B quedará congelada esperando la liberación del recurso.

--Paso 4 TERMINAL A (Liberación):
--Confirmamos la venta en Terminal A:
   BEGIN
       SP_CREAR_FACTURA(p_id_cliente => 2, p_id_sucursal => 1, p_id_empleado => 1, p_id_producto => 1, p_cantidad => 1);
   END;
   /
--La Terminal B se desbloquea automáticamente y arroja:
--ORA-20001: ERROR STOCK INSUFFICIENTE: Stock disponible (0), Solicitado (1).
-----------------------------------------------------------------------------------------------------------------------------------------------------------

--PRUEBA 2: CRASH TEST Y RECUPERACIÓN DE TRANSACCIONES (ROLLBACK)
--Objetivo: garantizar la atomicidad (ACID) del sistema, asegurando que si ocurre una falla o corte de conexión a mitad de una venta, la transacción se cancele por completo sin dejar facturas ni datos corruptos.

DECLARE
    v_id_venta NUMBER(5);
BEGIN
    SELECT NVL(MAX(ID_VENTA), 0) + 1 INTO v_id_venta FROM TB_ENCABEZADO_VENTA;

    -- Insertar Encabezado
    INSERT INTO TB_ENCABEZADO_VENTA (ID_VENTA, ID_CLIENTE, ID_SUCURSAL, ID_EMPLEADO, FECHA_VENTA, TOTAL_VENTA, ESTADO)
    VALUES (v_id_venta, 1, 1, 1, SYSDATE, 500.00, 'EN PROCESO');

    -- Forzar caída repentina del sistema / error en transacción
    RAISE_APPLICATION_ERROR(-20005, 'CRASH TEST: Simulación de caída del sistema antes de guardar el detalle.');

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('CRASH TEST EXITOSO: Se ejecutó ROLLBACK automáticamente. Ninguna venta corrupta fue almacenada.');
END;
/

-- Verificación de Integridad: No deben existir registros en estado 'EN PROCESO'
SELECT COUNT(*) AS VENTAS_CORRUPTAS FROM TB_ENCABEZADO_VENTA WHERE ESTADO = 'EN PROCESO';

