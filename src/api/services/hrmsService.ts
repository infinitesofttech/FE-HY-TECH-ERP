import {
  AttendanceRecord,
  LeaveRecord,
  HolidayItem,
  LeaveBalance,
  AttendanceStatus,
  LeaveType,
} from '@/types';
import {
  MOCK_HOLIDAYS,
  MOCK_LEAVES,
  MOCK_ATTENDANCES,
  MOCK_LEAVE_BALANCES,
} from '../mockData';

let localAttendances: AttendanceRecord[] = [...MOCK_ATTENDANCES];
let localLeaves: LeaveRecord[] = [...MOCK_LEAVES];
let localLeaveBalances: Record<number, LeaveBalance> = { ...MOCK_LEAVE_BALANCES };
let localHolidays: HolidayItem[] = [...MOCK_HOLIDAYS];

export const hrmsService = {
  // Get all leaves across employees (for Admin approval)
  async getAllLeaves(): Promise<LeaveRecord[]> {
    return localLeaves;
  },

  // Get all annual holidays
  async getHolidays(): Promise<HolidayItem[]> {
    return localHolidays;
  },

  // Get employee attendance history
  async getEmployeeAttendance(employeeId: number | string): Promise<AttendanceRecord[]> {
    const empId = Number(employeeId);
    let records = localAttendances.filter((a) => a.employee_id === empId);
    if (records.length === 0) {
      const template = localAttendances.filter((a) => a.employee_id === 4);
      records = template.map((t, idx) => ({
        ...t,
        id: 9000 + idx,
        employee_id: empId,
      }));
      localAttendances.push(...records);
    }
    return records;
  },

  // Get employee leave balance
  async getEmployeeLeaveBalance(employeeId: number | string): Promise<LeaveBalance> {
    const empId = Number(employeeId);
    return (
      localLeaveBalances[empId] || {
        casual_total: 12,
        casual_used: 2,
        sick_total: 7,
        sick_used: 1,
        paid_total: 5,
        paid_used: 1,
      }
    );
  },

  // Get employee leave requests history
  async getEmployeeLeaves(employeeId: number | string): Promise<LeaveRecord[]> {
    const empId = Number(employeeId);
    let leaves = localLeaves.filter((l) => l.employee_id === empId);
    if (leaves.length === 0) {
      const template = localLeaves.filter((l) => l.employee_id === 4);
      leaves = template.map((t, idx) => ({
        ...t,
        id: 8000 + idx,
        employee_id: empId,
      }));
      localLeaves.push(...leaves);
    }
    return leaves;
  },

  // Mark / Punch Attendance
  async punchAttendance(payload: {
    employee_id: number;
    date: string;
    in_time?: string;
    out_time?: string;
    status: AttendanceStatus;
    notes?: string;
  }): Promise<{ message: string; data: AttendanceRecord }> {
    const existingIdx = localAttendances.findIndex(
      (a) => a.employee_id === payload.employee_id && a.date === payload.date
    );

    const dateObj = new Date(payload.date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()] || 'Weekday';

    if (existingIdx >= 0) {
      localAttendances[existingIdx] = {
        ...localAttendances[existingIdx],
        ...payload,
        day_name: dayName,
        work_hours: payload.status === 'PRESENT' ? 9.0 : payload.status === 'HALF_DAY' ? 4.5 : 0,
      };
      return { message: 'Attendance updated successfully', data: localAttendances[existingIdx] };
    }

    const newRecord: AttendanceRecord = {
      id: Date.now(),
      employee_id: payload.employee_id,
      date: payload.date,
      day_name: dayName,
      in_time: payload.in_time || '09:30 AM',
      out_time: payload.out_time || '06:30 PM',
      status: payload.status,
      work_hours: payload.status === 'PRESENT' ? 9.0 : payload.status === 'HALF_DAY' ? 4.5 : 0,
      notes: payload.notes || 'Manually logged punch',
    };

    localAttendances = [newRecord, ...localAttendances];
    return { message: 'Attendance punched successfully', data: newRecord };
  },

  // Apply Leave
  async applyLeave(payload: {
    employee_id: number;
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string;
  }): Promise<{ message: string; data: LeaveRecord }> {
    const newLeave: LeaveRecord = {
      id: Date.now(),
      employee_id: payload.employee_id,
      leave_type: payload.leave_type,
      start_date: payload.start_date,
      end_date: payload.end_date,
      days_count: payload.days_count,
      reason: payload.reason,
      status: 'PENDING',
      applied_at: new Date().toISOString().split('T')[0],
    };

    localLeaves = [newLeave, ...localLeaves];
    return { message: 'Leave application submitted for approval', data: newLeave };
  },

  // Approve / Reject Leave
  async updateLeaveStatus(
    leaveId: number,
    status: 'APPROVED' | 'REJECTED',
    approvedBy: string = 'Admin Manager'
  ): Promise<{ message: string }> {
    const idx = localLeaves.findIndex((l) => l.id === leaveId);
    if (idx !== -1) {
      localLeaves[idx].status = status;
      localLeaves[idx].approved_by = approvedBy;
      // Deduct from balance if approved
      const empId = localLeaves[idx].employee_id;
      const balance = localLeaveBalances[empId];
      if (balance && status === 'APPROVED') {
        if (localLeaves[idx].leave_type === 'CASUAL') {
          balance.casual_used += localLeaves[idx].days_count;
        } else if (localLeaves[idx].leave_type === 'SICK') {
          balance.sick_used += localLeaves[idx].days_count;
        } else if (localLeaves[idx].leave_type === 'PAID') {
          balance.paid_used += localLeaves[idx].days_count;
        }
      }
      return { message: `Leave ${status.toLowerCase()} successfully` };
    }
    throw new Error('Leave record not found');
  },
};
