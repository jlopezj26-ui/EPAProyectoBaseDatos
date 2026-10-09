--LÓGICA DE NEGOCIO Y TRANSACCIONES (PL/SQL)

SET SERVEROUTPUT ON;

-- 1. TRIGGER PARA AUDITORÍA DE MOVIMIENTOS DE INVENTARIO TRAS UNA VENTA O REPOSICIÓN
CREATE OR REPLACE TRIGGER TRG_ACTUALIZA_MOVIMIENTO_INV
AFTER UPDATE OF STOCK ON TB_INVENTARIO
FOR EACH ROW
DECLARE
    v_diferencia NUMBER(10,2);
    v_tipo VARCHAR2(20);
    v_id_mov NUMBER(5);
BEGIN
    v_diferencia := :NEW.STOCK - :OLD.STOCK;
    
    IF v_diferencia < 0 THEN
        v_tipo := 'SALIDA VENTA';
        v_diferencia := ABS(v_diferencia);
    ELSIF v_diferencia > 0 THEN
        v_tipo := 'REPOSICION';
    ELSE
        RETURN;
    END IF;

    SELECT NVL(MAX(ID_MOVIMIENTO), 0) + 1 INTO v_id_mov FROM MOVIMIENTO_INVENTARIO;

    INSERT INTO MOVIMIENTO_INVENTARIO (
        ID_MOVIMIENTO, ID_SUCURSAL, ID_PRODUCTO, TIPO_MOVIMIENTO, CANTIDAD, FECHA_MOVIMIENTO, OBSERVACION
    ) VALUES (
        v_id_mov,
        :NEW.ID_SUCURSAL,
        :NEW.ID_PRODUCTO,
        v_tipo,
        v_diferencia,
        TRUNC(SYSDATE),
        'Movimiento automático registrado por Trigger tras actualización de stock.'
    );
END;
/

-- 2. PROCEDIMIENTO ALMACENADO PARA REGISTRAR FACTURAS CON CONCURRENCIA (FOR UPDATE)
CREATE OR REPLACE PROCEDURE SP_CREAR_FACTURA (
    p_id_cliente   IN NUMBER,
    p_id_sucursal  IN NUMBER,
    p_id_empleado  IN NUMBER,
    p_id_producto  IN NUMBER,
    p_cantidad     IN NUMBER
) IS
    v_id_inventario  NUMBER(5);
    v_stock_actual   NUMBER(10);
    v_precio_unit    NUMBER(10,2);
    v_subtotal       NUMBER(10,2);
    v_id_venta       NUMBER(5);
    v_id_detalle     NUMBER(5);
BEGIN
    -- Bloqueo de fila para evitar sobreventas simultáneas (FOR UPDATE)
    SELECT ID_INVENTARIO, STOCK
    INTO v_id_inventario, v_stock_actual
    FROM TB_INVENTARIO
    WHERE ID_SUCURSAL = p_id_sucursal AND ID_PRODUCTO = p_id_producto
    FOR UPDATE;

    -- Validar disponibilidad
    IF v_stock_actual < p_cantidad THEN
        RAISE_APPLICATION_ERROR(-20001, 'ERROR STOCK INSUFICIENTE: Stock disponible (' || v_stock_actual || '), Solicitado (' || p_cantidad || ').');
    END IF;

    -- Obtener el precio unitario del producto
    SELECT PRECIO_UNITARIO INTO v_precio_unit
    FROM TB_PRODUCTO
    WHERE ID_PRODUCTO = p_id_producto;

    v_subtotal := v_precio_unit * p_cantidad;

    -- Generación de IDs correlativos respetando los registros previos
    SELECT NVL(MAX(ID_VENTA), 0) + 1 INTO v_id_venta FROM TB_ENCABEZADO_VENTA;
    SELECT NVL(MAX(ID_DETALLE), 0) + 1 INTO v_id_detalle FROM TB_DETALLE_VENTA;

    -- Insertar Encabezado (Estado 'PAGADA' alineado al DML inicial)
    INSERT INTO TB_ENCABEZADO_VENTA (
        ID_VENTA, ID_CLIENTE, ID_SUCURSAL, ID_EMPLEADO, FECHA_VENTA, TOTAL_VENTA, ESTADO
    ) VALUES (
        v_id_venta, p_id_cliente, p_id_sucursal, p_id_empleado, TRUNC(SYSDATE), v_subtotal, 'PAGADA'
    );

    -- Insertar Detalle
    INSERT INTO TB_DETALLE_VENTA (
        ID_DETALLE, ID_VENTA, ID_INVENTARIO, CANTIDAD, PRECIO_UNITARIO, SUBTOTAL
    ) VALUES (
        v_id_detalle, v_id_venta, v_id_inventario, p_cantidad, v_precio_unit, v_subtotal
    );

    -- Actualizar stock (Desencadena el Trigger de movimiento automáticamente)
    UPDATE TB_INVENTARIO
    SET STOCK = STOCK - p_cantidad,
        FECHA_ACTUALIZACION = TRUNC(SYSDATE)
    WHERE ID_INVENTARIO = v_id_inventario;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('FACTURA GENERADA EXITOSAMENTE. ID Venta: ' || v_id_venta || ' | Total: Q' || v_subtotal);

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_CREAR_FACTURA;
/