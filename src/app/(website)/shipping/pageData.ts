export interface Address {
  id: number;
  name: string;
  type: "Home" | "Work";
  address: string;
  city: string;
  state: string;
  pincode: string;
  selected: boolean;
}

export const addresses: Address[] = [
  {
    id: 1,
    name: "adawe",
    type: "Home",
    address: "Flat number 3, ganpati bhawan, aira holmes, kasumpti",
    city: "Shimla",
    state: "Himachal Pradesh",
    pincode: "171009",
    selected: true,
  },
  {
    id: 2,
    name: "dwdwd",
    type: "Work",
    address: "Flat number 3, ganpati bhawan, aira holmes, kasumpti",
    city: "Shimla",
    state: "Himachal Pradesh",
    pincode: "171009",
    selected: false,
  },
];