const PROFILE_KEY = "techub_demo_profile";

export const initialProfile = {
  firstName: "Jaime",
  lastName: "Uy",
  email: "jaime.uy@example.com",
  phone: "+63 912 345 6789",
  birthDate: "",
  avatar: "",
};

export function getProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);

    return saved
      ? { ...initialProfile, ...JSON.parse(saved) }
      : { ...initialProfile };
  } catch {
    return { ...initialProfile };
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export const mockOrders = [
  {
    id: "TH20240918",
    date: "Sep 18, 2026",
    total: 18350,
    status: "Processing",
    icon: "package",
  },
  {
    id: "TH20240912",
    date: "Sep 12, 2026",
    total: 52990,
    status: "Delivered",
    icon: "monitor",
  },
  {
    id: "TH20240905",
    date: "Sep 5, 2026",
    total: 10750,
    status: "Delivered",
    icon: "cpu",
  },
];

export const mockAccountSummary = {
  totalOrders: 3,
  completedOrders: 2,
  cartItems: 2,
  savedAddresses: 2,
};
