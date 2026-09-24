/**
 * CareBot intent engine - lightweight rule-based NLU (no external API needed, works offline in demos).
 * detectIntent is pure so it can be unit-tested.
 */
const INTENTS = [
  { name: 'emergency', patterns: [/emergenc/, /burst/, /flood/, /gas (smell|leak)/, /smell(s)? gas/, /sparking/, /on fire/, /electric shock/, /no power/, /sos/] },
  { name: 'greeting', patterns: [/^(hi|hello|hey|good (morning|afternoon|evening))\b/] },
  { name: 'status', patterns: [/(my|latest|recent) (booking|order|job|appointment)/, /booking status/, /track/] },
  { name: 'coupon', patterns: [/coupon/, /discount/, /promo/, /offer/, /voucher/, /deal/] },
  { name: 'refund', patterns: [/refund/, /cancel/, /money back/, /dispute/, /complain/] },
  { name: 'pricing', patterns: [/how much/, /price/, /cost/, /estimate/, /charge/, /hourly rate/] },
  { name: 'problem', patterns: [/leak/, /broken/, /not working/, /stopped/, /clog/, /repair/, /fix/, /install/, /noisy/, /won't/, /isn't/, /need (a|an)/, /fridge|washer|dryer|\bac\b|heater|pipe|faucet|toilet|outlet|wiring|breaker|light/] },
  { name: 'howto', patterns: [/how (do|does|can|to)/, /how it works/, /getting started/, /what can you do/, /^help\b/] }
];

const detectIntent = (text = '') => {
  const t = text.toLowerCase().trim();
  for (const intent of INTENTS) {
    if (intent.patterns.some((re) => re.test(t))) return intent.name;
  }
  return 'fallback';
};

module.exports = { detectIntent };
