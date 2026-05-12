const Fee = require('../../../domain/entities/Fee');

/**
 * APPLICATION LAYER — Fee Use Cases
 */
class FeeUseCases {
  constructor(feeRepository, studentRepository) {
    this.feeRepository = feeRepository;
    this.studentRepository = studentRepository;
  }

  async getAllFees(filters = {}) {
    return this.feeRepository.findAll(filters);
  }

  async getFeeById(id) {
    const fee = await this.feeRepository.findById(id);

    if (!fee) {
      throw new Error('Fee record not found');
    }

    return fee;
  }

  async getStudentFees(studentId) {
    return this.feeRepository.findByStudent(studentId);
  }

  async createFee(data) {
    const { studentId, month, dueDate, status } = data;

    const student = await this.studentRepository.findById(studentId);

    if (!student) {
      throw new Error('Student not found');
    }

    // Apply domain fee formula if amount not provided
    const amount =
      data.amount || Fee.calculateAmount(student.classId);

    return this.feeRepository.create({
      studentId: student._id,
      studentName: student.name,
      studentCode: student.studentId,
      classId: student.classId,
      section: student.section,
      month,
      amount,
      dueDate: new Date(dueDate),
      status: status || 'Pending',
    });
  }

  async markAsPaid(id) {
    const fee = await this.feeRepository.findById(id);

    if (!fee) {
      throw new Error('Fee record not found');
    }

    return this.feeRepository.update(id, {
      status: 'Paid',
      paidDate: new Date(),
    });
  }

  async markAsOverdue(id) {
    const fee = await this.feeRepository.findById(id);

    if (!fee) {
      throw new Error('Fee record not found');
    }

    return this.feeRepository.update(id, {
      status: 'Overdue',
    });
  }

  async updateFee(id, data) {
    const fee = await this.feeRepository.findById(id);

    if (!fee) {
      throw new Error('Fee record not found');
    }

    return this.feeRepository.update(id, data);
  }

  async deleteFee(id) {
    const fee = await this.feeRepository.findById(id);

    if (!fee) {
      throw new Error('Fee record not found');
    }

    return this.feeRepository.delete(id);
  }

  /**
   * Batch generate fees for all students for a given month
   */
  async generateMonthlyFees(month, dueDate) {
    if (!month || !dueDate) {
      throw new Error('Month and due date are required');
    }

    const generated =
      await this.feeRepository.generateMonthlyFees(
        month,
        dueDate
      );

    return {
      count: generated.inserted,
    };
  }

  async getMonths() {
    return this.feeRepository.getDistinctMonths();
  }

  async getFeeFormula() {
    return {
      aboveGrade5: {
        classes: ['6', '7', '8', '9', 'X'],
        amount: 50000,
      },

      upToGrade5: {
        classes: [
          'playgroup',
          'prenursery',
          'nursery',
          '1',
          '2',
          '3',
          '4',
          '5',
        ],
        amount: 40000,
      },
    };
  }
}

module.exports = FeeUseCases;