class FeeController {
  constructor(feeUseCases) {
    this.feeUseCases = feeUseCases;
  }

  getAll = async (req, res, next) => {
    try {
      const { month, classId, status, search } = req.query;
      const fees = await this.feeUseCases.getAllFees({ month, classId, status, search });
      res.json({ success: true, data: fees, count: fees.length });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const fee = await this.feeUseCases.getFeeById(req.params.id);
      res.json({ success: true, data: fee });
    } catch (err) {
      if (err.message === 'Fee record not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  getStudentFees = async (req, res, next) => {
    try {
      const fees = await this.feeUseCases.getStudentFees(req.params.studentId);
      res.json({ success: true, data: fees });
    } catch (err) { next(err); }
  };

  create = async (req, res, next) => {
    try {
      const fee = await this.feeUseCases.createFee(req.body);
      res.status(201).json({ success: true, data: fee });
    } catch (err) {
      if (err.message === 'Student not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  markAsPaid = async (req, res, next) => {
    try {
      const fee = await this.feeUseCases.markAsPaid(req.params.id);
      res.json({ success: true, data: fee });
    } catch (err) {
      if (err.message === 'Fee record not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  markAsOverdue = async (req, res, next) => {
    try {
      const fee = await this.feeUseCases.markAsOverdue(req.params.id);
      res.json({ success: true, data: fee });
    } catch (err) {
      if (err.message === 'Fee record not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const fee = await this.feeUseCases.updateFee(req.params.id, req.body);
      res.json({ success: true, data: fee });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.feeUseCases.deleteFee(req.params.id);
      res.json({ success: true, message: 'Fee record deleted' });
    } catch (err) { next(err); }
  };

  generateMonthly = async (req, res, next) => {
    try {
      const { month, dueDate } = req.body;
      const result = await this.feeUseCases.generateMonthlyFees(month, dueDate);
      res.json({ success: true, message: `Generated ${result.count} fee records`, count: result.count });
    } catch (err) { next(err); }
  };

  getMonths = async (req, res, next) => {
    try {
      const months = await this.feeUseCases.getMonths();
      res.json({ success: true, data: months });
    } catch (err) { next(err); }
  };

  getFormula = async (req, res, next) => {
    try {
      const formula = await this.feeUseCases.getFeeFormula();
      res.json({ success: true, data: formula });
    } catch (err) { next(err); }
  };
}

module.exports = FeeController;
