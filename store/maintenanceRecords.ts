import { MaintenanceRecord } from "@prisma/client";
import { create } from "zustand";

interface MaintenanceRecordState {
  maintenanceRecords: MaintenanceRecord[];
  setMaintenanceRecords: (maintenanceRecords: MaintenanceRecord[]) => void;
}

export const useMaintenanceRecords = create<MaintenanceRecordState>((set) => ({
  maintenanceRecords: [],
  setMaintenanceRecords: (maintenanceRecords) =>
    set({ maintenanceRecords }),
}));
