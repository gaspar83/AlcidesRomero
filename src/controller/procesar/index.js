'use strict';

const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
const dbConfig = require('../../config/dbconfig');

function padToFifteen(number) {
  if (number <= 99999999999999) { number = ("000000000000000" + number).slice(-15); }
  return number;
}

async function procesarPago(req, res) {

  const { nroDocumento, importe, nroOperacion, nroCuota } = req.body;
  let connection;

  try {

    connection = await oracledb.getConnection(dbConfig);

    let importeCeros = typeof (importe) === 'string' ? importe : padToFifteen(importe);

    const procesarPagoPROC = await connection.execute(
      `BEGIN
        sp_insertar_recibo_pronet(
            :p_cliente,
            :p_nro_operacion,
            :p_nro_cuota,
            :p_importe_pago,
            :p_result
        );
       END;`,
      {
        p_cliente: parseInt(nroDocumento.toString()),
        p_nro_operacion: parseInt(nroOperacion),
        p_nro_cuota: parseInt(nroCuota),
        p_importe_pago: parseFloat(importeCeros),
        p_result: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      }
    );



    let respuesta = { 
      "codServicio": "000",
      "tipoTrx": 3,
      "codRetorno": 0,
      "desRetorno": procesarPagoPROC.outBinds.p_result, //OK
      "timbrado": "11620908",
      "importeGrabado": "000000000000000",
      "iva10": "000000000000000" 
    };


    return res.send(respuesta);

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
  procesarPago
}