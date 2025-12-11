import "dotenv/config";
import { ethers } from "ethers";

async function main() {
  try {
    const [, , privateKeyRaw, toAddress, amountRaw] = process.argv;

    if (!privateKeyRaw || !toAddress || !amountRaw) {
      console.log("❌ Використання:");
      console.log("node send-native.mjs <PRIVATE_KEY> <TO_ADDRESS> <AMOUNT>");
      console.log("Приклад: node send-native.mjs 0xabc123... 0xReceiver 0.05");
      process.exit(1);
    }

    const RPC_URL = process.env.RPC_URL;
    if (!RPC_URL) {
      console.error("❌ Помилка: RPC_URL не вказаний у .env файлі");
      process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const privateKey = privateKeyRaw.startsWith("0x")
      ? privateKeyRaw
      : "0x" + privateKeyRaw;

    let wallet;
    try {
      wallet = new ethers.Wallet(privateKey, provider);
    } catch (e) {
      console.error("❌ Невалідний приватний ключ.");
      console.error(e.message);
      process.exit(1);
    }

    console.log(`👤 Відправник: ${wallet.address}`);
    console.log(`➡️ Отримувач: ${toAddress}`);
    console.log(`💰 Сума: ${amountRaw}`);

    let value;
    try {
      value = ethers.parseEther(amountRaw);
    } catch (e) {
      console.error("❌ Помилка: некоректна сума AMOUNT.");
      console.error(e.message);
      process.exit(1);
    }

    const tx = await wallet.sendTransaction({
      to: toAddress,
      value,
    });

    console.log("🚀 Транзакція відправлена!");
    console.log("🔗 TX hash:", tx.hash);

    console.log("⏳ Очікування підтвердження...");
    const receipt = await tx.wait();

    console.log("📄 receipt.status:", receipt.status);

    // У ethers v6 це number: 1 (success) або 0 (fail)
    if (receipt.status === 1) {
      console.log("✅ Транзакція підтверджена!");
      console.log(`📦 Block: ${receipt.blockNumber}`);
      console.log(`🔗 ${tx.hash}`);
    } else if (receipt.status === 0) {
      console.log(
        "⚠️ Транзакція виконана, але зі статусом 0 (revert). Перевір блок-експлорер."
      );
      console.log(`🔗 ${tx.hash}`);
    } else {
      console.log("🤔 Невідомий статус транзакції, дивись у блок-експлорері.");
      console.log(`Статус:`, receipt.status);
      console.log(`🔗 ${tx.hash}`);
    }
  } catch (err) {
    console.error("💥 Глобальна помилка:", err.message || err);
  }
}

main();
