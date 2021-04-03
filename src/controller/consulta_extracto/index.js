//'use strict';

const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
const dbConfig = require('../../config/dbconfig');

function padToFifteen(number) {
  if (number <= 999999999999) { 
    number = ("0000000000000"+number).slice(-13); 
  }

  return number;
}

async function consulta(req, res) {

  const  { nroDocumento } = req.body;
  let connection;

  try {
    
    let query = `select cedula, 
    nombreapellido, 
    nro_operacion, 
    des_operacion, 
    nro_cuota, 
    capital, 
    monto_interes  interes, 
    total_detalle  importe, 
    moneda, 
    to_char(fecha_vto,'dd/mm/yyyy') fecha_vto 
    from v_consulta_aquipago_detalle 
    where cedula = :cedula 
    and rownum < 7`

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(query, [nroDocumento]);

    let objetoRespuesta = {
      "codServicio":"000",
      "tipoTrx":5,
      "codRetorno":0,
      "desRetorno":"Aprobado",
      "cedula": nroDocumento,
      "nombreApellido":result.rows[0].NOMBREAPELLIDO,
      "cantFilas":result.rows.length,
      "detalles" : [],
    }

    result.rows.map((item) => {
      let objetoDetalle = {
        "nroOperacion": item.NRO_OPERACION.toString(),
        "desOperacion":"CUOTA",
        "nroCuota": item.NRO_CUOTA,
        "capital": padToFifteen(item.CAPITAL) + '00',
        "interes": padToFifteen(item.INTERES) + '00',
        "mora":"000000000000000",
        "punitorio":"000000000000000",
        "gastos":"000000000000000",
        "iva_10":"000000000000000",
        "iva_5":"000000000000000",
        "totalDetalle": padToFifteen(item.IMPORTE) + '00',
        "moneda":"1",
        "fechaVencimiento": item.FECHA_VTO,
        "totalFacturaInteres":"000000000000000",
        "serviciosCobranza":"000000000000000"
      };
      objetoRespuesta.detalles.push(objetoDetalle)
    });

    const zero = 0;
    const auditoria = await connection.execute(
      `BEGIN
        sp_insertar_auditoria_ws(
          :p_tipo,
          :p_cliente,
          :p_nro_operacion,
          :p_nro_cuota,
          :p_importe_pago,
          :p_clave_factura,
          :p_clave_recibo,
          :p_clave_factura_int,
          :p_mensaje,
          :p_result
        );
       END;`,
      {
        p_tipo:  'CONSULTAR',
        p_cliente: nroDocumento,
        p_nro_operacion : parseInt(zero),
        p_nro_cuota : parseInt(zero),
        p_importe_pago : parseInt(zero),
        p_clave_factura : parseInt(zero),
        p_clave_recibo : parseInt(zero),
        p_clave_factura_int : parseInt(zero),
        p_mensaje: 'CONSULTA DE CUENTA',
        p_result:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      }
    );

    console.log(auditoria.outBinds);

    return res.send(objetoRespuesta);

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

module.exports = {
    consulta
}