const Record = require('../models/Record');

// Controlador para salvar ou atualizar o recorde
const saveRecord = async (req, res) => {
  const { username, time } = req.body;

  try {
    const existingRecord = await Record.findOne({ username });

    if (existingRecord) {
      if (time < existingRecord.time) {
        existingRecord.time = time;
        await existingRecord.save();
        return res.status(200).json({
          success: true,
          message: 'Record atualizado!',
          record: existingRecord,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: 'Seu tempo não é melhor que o recorde existente.',
          record: existingRecord,
        });
      }
    } else {
      const newRecord = new Record({ username, time });
      await newRecord.save();
      return res.status(201).json({
        success: true,
        message: 'Record criado!',
        record: newRecord,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao salvar o recorde.',
      error,
    });
  }
};

// Controlador para buscar o recorde existente
const getRecord = async (req, res) => {
  const { username } = req.query; // Supondo que você passe o username como query parameter

  try {
    const record = await Record.findOne({ username });

    if (record) {
      return res.status(200).json({
        success: true,
        record,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Nenhum recorde encontrado para o usuário.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar o recorde.',
      error,
    });
  }
};

module.exports = {
  saveRecord,
  getRecord,
};
