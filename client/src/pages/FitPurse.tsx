import { Link } from "wouter";
import { Button } from "../components/ui/button";

type RewardBrand = {
  name: string;
  category: string;
  reward: string;
  unlockRule: string;
  perks: string[];
};

const rewardBrands: RewardBrand[] = [
  {
    name: "Stride Fuel",
    category: "Nutrition",
    reward: "20% off gels and hydration packs",
    unlockRule: "Attend 2 verified run club events in a month",
    perks: ["Monthly coupon", "Free delivery over INR 999", "Bonus event-day sampler"],
  },
  {
    name: "PaceLab",
    category: "Running Shoes",
    reward: "INR 1500 off race-day trainers",
    unlockRule: "Complete 1 marathon or 3 community runs",
    perks: ["Priority fitting slot", "Free gait check", "Members-only colorways"],
  },
  {
    name: "RecoverX",
    category: "Recovery",
    reward: "Buy 1 get 1 on recovery sessions",
    unlockRule: "Check in to 4 events in 45 days",
    perks: ["Foam-roll workshop", "Physio consult discount", "Post-race recovery bundle"],
  },
  {
    name: "RunThread",
    category: "Apparel",
    reward: "25% off seasonal running kits",
    unlockRule: "Attend any 3 verified events",
    perks: ["Early access drops", "Team customization", "Free club patch add-on"],
  },
];

export default function FitPursePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      <section className="border-b border-[#1a1a1a] bg-[#0a0a0a] py-14 md:py-20">
        <div className="container">
          <p className="section-label mb-3">// Fit Purse</p>
          <h1 className="font-display text-4xl font-black uppercase tracking-[-0.02em] text-foreground md:text-5xl">
            Fitness <span className="text-primary">Curr₹ncy</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#aaaaaa] md:text-[16px]">
            Fit Purse connects your verified Treadgram attendance to rewards from partner brands. Show up to run
            clubs, marathons, and events, then unlock real perks from gear, nutrition, and recovery partners.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/events">Find events</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/explore">Browse clubs</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-2">
            {rewardBrands.map((brand) => (
              <article key={brand.name} className="border border-[#222222] bg-[#111111] p-6">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  {brand.category}
                </p>
                <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[-0.02em] text-foreground">
                  {brand.name}
                </h2>
                <p className="mt-3 text-[15px] text-[#d0d0d0]">{brand.reward}</p>
                <p className="mt-2 text-sm text-[#9a9a9a]">
                  <span className="text-[#cfcfcf]">Unlock:</span> {brand.unlockRule}
                </p>
                <ul className="mt-4 space-y-1 text-sm text-[#aaaaaa]">
                  {brand.perks.map((perk) => (
                    <li key={perk}>- {perk}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
