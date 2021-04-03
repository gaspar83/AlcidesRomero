'use strict';

const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
const dbConfig = require('../../config/dbconfig');

async function anularPago(req, res) {

  const { nroDocumento, importe, nroOperacion, nroCuota } = req.body;
  let connection;

  try {
    
    connection = await oracledb.getConnection(dbConfig);

    const anularPagoPROC = await connection.execute(
      `BEGIN
        sp_anular_recibo_pronet(
            :p_cliente,
            :p_nro_operacion,
            :p_nro_cuota,
            :p_importe_pago,
            :p_result
        );
       END;`,
      {
        p_cliente: parseInt(nroDocumento),
        p_nro_operacion: parseInt(nroOperacion),
        p_nro_cuota: parseInt(nroCuota),
        p_importe_pago: parseFloat(importe),
        p_result:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      }
    );

    let respuesta = {
      "codServicio":"000",
      "tipoTrx":4,
      "codRetorno":0,
      "desRetorno": anularPagoPROC.outBinds.p_result,
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
    anularPago
}