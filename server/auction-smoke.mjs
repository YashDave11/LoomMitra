// Auction House end-to-end smoke test against the running dev server.
const BASE = "http://localhost:4000";
const ts = Date.now();
const assert = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); process.exit(1); } console.log("ok:", msg); };

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

let seq = 0;
const reg = async (role) => (await api("/auth/register", { method: "POST", body: { email: `smoke${role}${ts}_${seq++}@t.com`, password: "pass1234", role } })).data.token;
const weaver = await reg("WEAVER");
const cust1 = await reg("CUSTOMER");
const cust2 = await reg("CUSTOMER");
const biz = await reg("BUSINESS");

const pr = await api("/api/products", { method: "POST", token: weaver, body: { title: "Smoke Test Saree", type: "SAREE", price: 5000, stock: 1 } });
const product = pr.data;
assert(product?.id, `product created (${pr.status} ${JSON.stringify(pr.data)})`);

const now = Date.now();
let r = await api("/api/auctions", { method: "POST", token: weaver, body: {
  productId: product.id, basePrice: 5000,
  startTime: new Date(now - 1000).toISOString(), endTime: new Date(now + 3600000).toISOString(),
  minBidIncrement: 100, buyNowPrice: 10000, reservedPrice: 6000,
}});
assert(r.status === 201 && r.data.status === "LIVE", `auction created LIVE (${r.status} ${r.data?.status || r.data?.error})`);
const auctionId = r.data.id;

r = await api("/api/auctions", { method: "POST", token: weaver, body: { productId: product.id, basePrice: 5000, startTime: new Date(now).toISOString(), endTime: new Date(now + 3600000).toISOString() } });
assert(r.status === 409, "duplicate active auction rejected");

r = await api("/api/auctions", { method: "POST", token: cust1, body: { productId: product.id, basePrice: 1, startTime: new Date(now).toISOString(), endTime: new Date(now + 3600000).toISOString() } });
assert(r.status === 403, "customer cannot create auction");

r = await api(`/api/auctions/${auctionId}/bids`, { method: "POST", token: biz, body: { amount: 5000 } });
assert(r.status === 403, "business cannot bid");

r = await api(`/api/auctions/${auctionId}/bids`, { method: "POST", token: cust1, body: { amount: 4000 } });
assert(r.status === 400 && r.data.error === "BID_BELOW_BASE", "bid below base rejected");

r = await api(`/api/auctions/${auctionId}/bids`, { method: "POST", token: cust1, body: { amount: 5000 } });
assert(r.status === 201 && r.data.highestBid === 5000, "first bid accepted");

r = await api(`/api/auctions/${auctionId}/bids`, { method: "POST", token: cust2, body: { amount: 5050 } });
assert(r.status === 400 && r.data.error === "BID_TOO_LOW", `bid under min increment rejected (${r.status} ${JSON.stringify(r.data).slice(0, 200)})`);

r = await api(`/api/auctions/${auctionId}/bids`, { method: "POST", token: cust2, body: { amount: 5200 } });
assert(r.status === 201 && r.data.highestBid === 5200, "outbid accepted");
assert(r.data.bids[0].bidderMask.endsWith("***"), "bidder name masked");

r = await api("/api/auctions", { token: cust1 });
assert(r.data.some((a) => a.id === auctionId), "auction appears in browse list");

r = await api(`/api/auctions/${auctionId}/bids`, { method: "POST", token: cust1, body: { amount: 10000 } });
assert(r.status === 201 && r.data.status === "ENDED" && r.data.result === "WON" && r.data.finalPrice === 10000 && r.data.orderStatus === "pending_payment", "buy-now ends auction with winner + pending_payment reservation");

r = await api(`/api/auctions/${auctionId}/bids`, { method: "POST", token: cust2, body: { amount: 11000 } });
assert(r.status === 400 && r.data.error === "AUCTION_NOT_LIVE", "bids blocked after end");

const { data: p2 } = await api("/api/products", { method: "POST", token: weaver, body: { title: "Smoke Muffler", type: "MUFFLER", price: 800, stock: 1 } });
const now2 = Date.now();
r = await api("/api/auctions", { method: "POST", token: weaver, body: {
  productId: p2.id, basePrice: 800, reservedPrice: 99999,
  startTime: new Date(now2 - 1000).toISOString(), endTime: new Date(now2 + 4000).toISOString(),
}});
assert(r.status === 201, `short auction created (${r.status} ${JSON.stringify(r.data).slice(0, 120)})`);
const a2 = r.data.id;
await api(`/api/auctions/${a2}/bids`, { method: "POST", token: cust1, body: { amount: 900 } });
await new Promise((res) => setTimeout(res, 5000));
r = await api(`/api/auctions/${a2}`, { token: weaver });
assert(r.data.status === "ENDED" && r.data.result === "NO_SALE", "expired auction below reserve => ENDED / NO_SALE");

const { data: p3 } = await api("/api/products", { method: "POST", token: weaver, body: { title: "Smoke Stole", type: "STOLE", price: 1200, stock: 1 } });
r = await api("/api/auctions", { method: "POST", token: weaver, body: {
  productId: p3.id, basePrice: 1200,
  startTime: new Date(now + 3600000).toISOString(), endTime: new Date(now + 7200000).toISOString(),
}});
assert(r.data.status === "UPCOMING", "future start => UPCOMING");
const a3 = r.data.id;
r = await api(`/api/auctions/${a3}/bids`, { method: "POST", token: cust1, body: { amount: 1500 } });
assert(r.status === 400 && r.data.error === "AUCTION_NOT_LIVE", "no bids on upcoming auction");
r = await api(`/api/auctions/${a3}/cancel`, { method: "POST", token: cust1 });
assert(r.status === 403, "customer cannot cancel");
r = await api(`/api/auctions/${a3}/cancel`, { method: "POST", token: weaver });
assert(r.data.status === "CANCELLED", "weaver cancels upcoming auction");

console.log("\nALL AUCTION SMOKE TESTS PASSED");
