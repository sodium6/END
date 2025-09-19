const { NotFoundError } = require('../../utils/error.js');

module.exports = {
  getsCustomer: async (req, res) => {
    try {
      return res.json({
        message: 'getsCustomer',
      });
    } catch (error) {
      throw error;
    }
  },
  getCustomer: async (req, res) => {
    try {
      const { id } = await req.params;

      if (id === '1') {
        throw new NotFoundError(`not found id = ${id}`);
      }

      return res.json({
        success: true,
        id,
      });
    } catch (error) {
      throw error;
    }
  },
};
