export interface FarmerData {
  district: string;
  crop: string;
  landSize: number;
  ownership: 'owned' | 'tenant' | 'leasehold';
  farmerName: string;
}
