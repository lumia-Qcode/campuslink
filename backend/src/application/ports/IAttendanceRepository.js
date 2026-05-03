/**
 * PORT: IAttendanceRepository
 * Defines the contract the application layer uses to persist / query
 * attendance records. Concrete adapters (Mongo, in-memory, etc.) implement this.
 */
class IAttendanceRepository {
  /**
   * Return all AttendanceRecord domain objects for a given student.
   * @param {string} studentId  – ObjectId string of the Student document
   * @returns {Promise<AttendanceRecord[]>}
   */
  async findByStudentId(studentId) { throw new Error('Not implemented'); }

  /**
   * Return attendance records filtered by status.
   * @param {string} studentId
   * @param {string} status  – 'Present' | 'Absent' | 'Late' | 'Leave'
   * @returns {Promise<AttendanceRecord[]>}
   */
  async findByStudentIdAndStatus(studentId, status) { throw new Error('Not implemented'); }

  /**
   * Return attendance records within an inclusive date range.
   * @param {string} studentId
   * @param {Date}   from
   * @param {Date}   to
   * @returns {Promise<AttendanceRecord[]>}
   */
  async findByStudentIdAndDateRange(studentId, from, to) { throw new Error('Not implemented'); }

  /**
   * Persist a new attendance record.
   * @param {object} data
   * @returns {Promise<AttendanceRecord>}
   */
  async create(data) { throw new Error('Not implemented'); }

  /**
   * Update an existing record.
   * @param {string} id
   * @param {object} data
   * @returns {Promise<AttendanceRecord>}
   */
  async update(id, data) { throw new Error('Not implemented'); }

  /**
   * Upsert attendance for a student on a given date.
   * Used by teachers to save/overwrite attendance.
   * @param {string} studentId  – ObjectId string
   * @param {Date}   date
   * @param {string} status     – 'Present' | 'Absent' | 'Late' | 'Leave'
   * @param {string} [note]
   * @returns {Promise<AttendanceRecord>}
   */
  async upsertForStudent(studentId, date, status, note) { throw new Error('Not implemented'); }

  /**
   * Return all attendance records for a given date across multiple students.
   * Used by teachers to view class attendance on a specific day.
   * @param {string[]} studentIds
   * @param {Date}     date
   * @returns {Promise<AttendanceRecord[]>}
   */
  async findByStudentIdsAndDate(studentIds, date) { throw new Error('Not implemented'); }

  /**
   * Delete a single attendance record by id.
   * @param {string} id
   */
  async delete(id) { throw new Error('Not implemented'); }
}

module.exports = IAttendanceRepository;
