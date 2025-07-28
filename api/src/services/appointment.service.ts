import { Appointment, IAppointment } from "../models";




export class AppointmentService {
  static async createAppoint(appointmentdata: IAppointment) {
    try {
      // Check if appointment already exists
      const existingAppointment = await Appointment.findOne({
        patient: appointmentdata.patient,

        appointmentDate: appointmentdata.appointmentDate,
      });
      if (existingAppointment) {
        throw new Error(
          "Appointment already exists for this patient and doctor at the specified date"
        );
      }
      // Create new appointment
      const appointment = await Appointment.create(appointmentdata);
      return appointment;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async getAppointmentById(id: string): Promise<IAppointment | null> {
    try {
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      return appointment;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateAppointment(
    id: string,
    updateData: Partial<IAppointment>
  ) {
    try {
      //  checking if appointment exists
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      const sanitizedData = { ...updateData };
      delete sanitizedData.patient; // prevent changing patient

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        sanitizedData,
        { new: true, runValidators: true }
      );
      if (!updatedAppointment) {
        throw new Error("Error updating appointment");
      }
      return updatedAppointment;
    } catch (error: any) {

      throw new Error(error.message);
    }
  }
  static async deleteAppointment(id: string) {
    try {
      const appointment = await Appointment.findByIdAndDelete(id);


      return appointment;
    } catch (error: any) {

      throw new Error(error.message);
    }
  }
}
