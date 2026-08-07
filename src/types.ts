export interface Channel {
  id: string;
  name: string;
  aliases: string[];
  logo: string;
  bgColor?: string;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  channels: string[];
}
