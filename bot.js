require('dotenv').config();
const { ethers } = require('ethers');
const fetch = require('node-fetch');
const chalk = require('chalk');
const fs = require('fs');

// Clear screen sebelum memulai bot
console.clear();

// Memuat konfigurasi dan ABI dari file JSON
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const TPOL_ABI = JSON.parse(fs.readFileSync('abi.json', 'utf8'));

const ITERATIONS = config.ITERATIONS;
const RPC_URL = config.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Membuat provider dan wallet instance untuk Polygon
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Mendapatkan alamat wallet secara otomatis dari private key
const WALLET_ADDRESS = wallet.address;
const WMATIC_ADDRESS = config.WMATIC_ADDRESS;
const TPOL_ADDRESS = config.TPOL_ADDRESS;
const APi_TOTAL_POINT = config.APi_TOTAL_POINT;
const API_URL_CHECK_IN = config.API_URL_CHECK_IN;
const API_URL_CURRENT = config.API_URL_CURRENT;
const API_URLS = config.API_URLS;

// Headers untuk semua request API
const headers = {
    "Content-Type": "application/json",
    "Origin": "https://app.tea-fi.com",
    "Referer": "https://app.tea-fi.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

// Banner
const banner = `
${chalk.blueBright(`
█████╗ ██╗   ██╗████████╗ ██████╗
██╔══██╗██║   ██║╚══██╔══╝██╔═══██╗
███████║██║   ██║   ██║   ██║   ██║
██╔══██║██║   ██║   ██║   ██║   ██║
██║  ██║╚██████╔╝   ██║   ╚██████╔╝
╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝
`)}

${chalk.red('ＢＯＴ ')}${chalk.yellow('ＡＵＴＯ ')}${chalk.green('ＳＷＡＰ ')}${chalk.cyan('ＴＥＡＦＩ')}

Telegram : ${chalk.cyan('https://t.me/airdropfetchofficial')}
${chalk.magenta('================================================================')}
`;

console.log(banner);

// Fungsi untuk melakukan POST request (check-in)
const dailyCheckIn = async (retryCount = 3) => {
    try {
        console.log(
            chalk.magenta('[') +                // [ warna ungu
            chalk.red('#') +                    // # warna merah
            chalk.magenta('] ') +               // ] warna ungu
            chalk.cyan('Running The script')    // "Running The script" warna biru muda (cyan)
        );
        
        console.log(
            chalk.magenta('[') +                // [ warna ungu
            chalk.red('?') +                    // ? warna merah
            chalk.magenta('] ') +               // ] warna ungu
            chalk.redBright('Loading Data Respone !!!') // "Loading Data Respone" warna merah cerah/muda
        );
        
        console.log(
            chalk.magenta('[') +                // [ warna ungu
            chalk.red('+') +                    // + warna merah
            chalk.magenta('] ') +               // ] warna ungu
            chalk.yellow('Wallet Address: ') +  // "Wallet Address:" warna kuning
            chalk.cyan(WALLET_ADDRESS)          // Alamat wallet warna biru muda (cyan)
        );
        

        const payload = { address: WALLET_ADDRESS };
        const response = await fetch(`${API_URL_CHECK_IN}?address=${WALLET_ADDRESS}`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.status === 201) {
            console.log(
                chalk.magenta('[') +    // [ warna ungu
                chalk.red('✓') +        // ✓ warna merah
                chalk.magenta('] ') +   // ] warna ungu
                chalk.green('Success Claim daily Sugar') // Teks warna hijau
            );
            
        } else if (response.status === 400 && data.message === "Already checked in today") {
            console.log(
                chalk.magenta('[') +        // [ warna ungu
                chalk.red('!') +            // ! warna merah
                chalk.magenta('] ') +       // ] warna ungu
                chalk.hex('#FFA500')('Already Checkin Daily Sugar') // Teks warna emas/oranye
            );
            
        } else if (response.status === 400) {
            if (retryCount > 0) {
                console.log(chalk.red(`[X] Gagal Check-in! Status: ${response.status}, Respon: ${JSON.stringify(data)}. Retrying...`));
                await delay(2000);
                await dailyCheckIn(retryCount - 1);
            } else {
                console.log(chalk.red(`[X] Gagal setelah 3 kali percobaan. Melanjutkan ke hari berikutnya...`));
            }
        }

        // Jalankan cycles dengan iterasi
        for (let i = 0; i < ITERATIONS; i++) {
            await performCycle(i);
            // Tambah delay 5 detik antara setiap iterasi
            if (i < ITERATIONS - 1) {
                await delay(5000);
            }
        }

        await getTotalPoint();
        await startCountdown();
    } catch (error) {
        console.error(chalk.red("\n[ERROR] Gagal menghubungi API:", error));

        // Tetap jalankan cycles meski check-in gagal
        for (let i = 0; i < ITERATIONS; i++) {
            await performCycle(i);
            if (i < ITERATIONS - 1) {
                await delay(5000);
            }
        }

        await getTotalPoint();
        await startCountdown();
    }
};

// Fungsi untuk menambahkan delay sebelum mencoba lagi
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fungsi untuk memulai countdown ke hari berikutnya dengan format custom
const startCountdown = async () => {
    // Generate random reset time once when starting countdown
    const randomHour = Math.floor(Math.random() * 8) + 1; // 1-8
    const randomMinute = Math.floor(Math.random() * 60); // 0-59

    console.log(
        '\n' + // Baris baru
        chalk.magenta('[') +                 // [ warna ungu
        chalk.red('?') +                     // ? warna merah
        chalk.magenta('] ') +                // ] warna ungu
        chalk.green('Loading claiming again on ') + // Teks warna hijau
        chalk.red(randomHour.toString().padStart(2, '0')) + ':' +  // Jam merah
        chalk.yellow(randomMinute.toString().padStart(2, '0')) +   // Menit kuning
        chalk.green(' UTC')                  // UTC hijau
    );
    

    const updateCountdown = () => {
        const now = new Date();
        const nextReset = new Date(now);

        // Set to today's reset time
        nextReset.setUTCHours(randomHour, randomMinute, 0, 0);

        // If we're past today's reset time, set for tomorrow
        if (now > nextReset) {
            nextReset.setUTCDate(nextReset.getUTCDate() + 1);
        }

        const timeUntilReset = nextReset - now;

        // Calculate remaining time
        const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeUntilReset % (1000 * 60)) / 1000);

        // Display updated countdown on same line
        process.stdout.write(chalk.greenBright(`\r[➡️] Waiting to Start: ${hours}j ${minutes}m ${seconds}s`));
        

        // If countdown finished, do check-in
        if (timeUntilReset <= 0) {
            clearInterval(countdownInterval);
            dailyCheckIn();
        }
    };

    // Update countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);

    // Call once to display countdown immediately
    updateCountdown();
};

// Fetch gas quote from API
const getGasQuote = async () => {
    try {
        const response = await fetch(
            `${API_URLS.GAS_QUOTE}?chain=137&txType=2&gasPaymentToken=0x0000000000000000000000000000000000000000&neededGasPermits=0`,
            {
                headers: headers
            }
        );
        const data = await response.json();
        return data.gasInGasPaymentToken;
    } catch (error) {
        console.error(chalk.red("Error fetching gas quote:", error));
        throw error;
    }
};

const notifyTransaction = async (hash, isWrap, gasFeeAmount) => {
    try {
        const payload = {
            blockchainId: 137,
            type: isWrap ? 2 : 3,  // type 2 untuk wrap, 3 untuk unwrap
            walletAddress: WALLET_ADDRESS,
            hash: hash,
            fromTokenAddress: isWrap ?
                "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" :
                "0x1Cd0cd01c8C902AdAb3430ae04b9ea32CB309CF1",
            toTokenAddress: isWrap ?
                "0x1Cd0cd01c8C902AdAb3430ae04b9ea32CB309CF1" :
                "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            fromTokenSymbol: isWrap ? "WPOL" : "tPOL",
            toTokenSymbol: isWrap ? "tPOL" : "WPOL",
            fromAmount: "1000000000000000000",
            toAmount: "1000000000000000000",
            gasFeeTokenAddress: "0x0000000000000000000000000000000000000000",
            gasFeeTokenSymbol: "POL",
            gasFeeAmount: gasFeeAmount
        };

        console.log(
            chalk.magenta('[') +                  // Simbol [ warna ungu
            chalk.red('!') +                      // Simbol ! warna merah
            chalk.magenta('] ') +                 // Simbol ] warna ungu
            chalk.magentaBright('Checking Reward Transaction') // Teks "Checking Reward Transaction" warna ungu cerah (magenta cerah)
        );
        
        // console.log(chalk.cyan("Payload:"), JSON.stringify(payload, null, 2));

        const response = await fetch(API_URLS.TRANSACTION, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.status === 201) {
            console.log(
                chalk.magenta('[') +                     // [ warna ungu
                chalk.red('✓') +                         // ✓ warna merah
                chalk.magenta('] ') +                    // ] warna ungu
                chalk.green('Reward Swap ') +            // "Reward Swap" warna hijau
                chalk.white(isWrap ? 'WPOL ' : 'TPOL ') + // "WPOL" atau "TPOL" warna putih
                chalk.yellow('to ') +                    // "to" warna kuning
                chalk.white(isWrap ? 'TPOL ' : 'WPOL ') + // "TPOL" atau "WPOL" warna putih
                chalk.cyan('Point: ') +                  // "Point:" warna biru muda (cyan)
                chalk.yellow(result.pointsAmount)        // Balance warna kuning
            );
            
        } else {
            console.log(
                chalk.magenta('[') +        // [ warna ungu
                chalk.red('X') +            // X warna merah
                chalk.magenta('] ') +       // ] warna ungu
                chalk.red('Failed Swap: ') + // Teks "Failed Swap:" warna merah
                chalk.red(result)           // result warna merah
            );
            
        }
    } catch (error) {
        console.error(
            chalk.magenta('[') +        // [ warna ungu
            chalk.red('X') +            // X warna merah
            chalk.magenta('] ') +       // ] warna ungu
            chalk.red('Failed Swap: ') + // Teks "Failed Swap:" warna merah
            chalk.red(error)           // result warna merah
        );
        ;
    }
};

const performCycle = async (iteration) => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const tpolContract = new ethers.Contract(TPOL_ADDRESS, TPOL_ABI, wallet);
    const amount = ethers.parseEther("1");

    const GAS_PRICE = ethers.parseUnits("60", "gwei");

    try {
        console.log(chalk.magenta("================================================================"));
        console.log(
            chalk.magenta('[') +         // Simbol [ warna ungu
            chalk.red('#') +            // Simbol ▪️ warna merah
            chalk.magenta('] ') +        // Simbol ] warna ungu
            chalk.cyan('Start Number ') +// Teks "Start Number" warna cyan (biru muda)
            chalk.yellow('| ') +         // Simbol | warna kuning
            chalk.white(`${iteration + 1}/${ITERATIONS}`) // Angka 2/2 warna putih
        );
        

        // Wrap Process
        const wrapGasFee = await getGasQuote();
        console.log(
            chalk.magenta('[') +             // Simbol [ warna ungu
            chalk.red('?') +                 // Simbol ? warna merah
            chalk.magenta('] ') +            // Simbol ] warna ungu
            chalk.blueBright('Gas quote Swap ') + // Teks "Gas quote Swap" warna ungu cerah bersinar
            chalk.white('WPOL ') +           // "WPOL" warna putih
            chalk.yellow('to ') +            // "to" warna kuning
            chalk.white('TPOL: ') +          // "TPOL:" warna putih
            chalk.green(wrapGasFee)          // Code number warna hijau
        );
        

        const wrapTx = await tpolContract.wrap(
            amount,
            WALLET_ADDRESS,
            {
                gasPrice: GAS_PRICE
            }
        );
        console.log(
            chalk.magenta('[') +        // Simbol [ warna ungu
            chalk.red('+') +            // Simbol + warna merah
            chalk.magenta('] ') +       // Simbol ] warna ungu
            chalk.white('Transaction Hash: ') + // Teks warna putih
            chalk.green(wrapTx.hash)    // Hash warna hijau
        );
        

        const wrapReceipt = await wrapTx.wait();
        console.log(
            chalk.magenta('[') +        // Simbol [ warna ungu
            chalk.red('✓') +            // Simbol ✓ warna merah
            chalk.magenta('] ') +       // Simbol ] warna ungu
            chalk.green('Swap Successfull!!') // Teks "Swap Successfull!!" warna hijau
        );
        

        await delay(5000);
        await notifyTransaction(wrapReceipt.hash, true, wrapGasFee);

        await delay(5000);

        // Unwrap Process
        const unwrapGasFee = await getGasQuote();
        console.log(
            chalk.magenta('[') +                 // [ warna ungu
            chalk.red('+') +                     // + warna merah
            chalk.magenta('] ') +                // ] warna ungu
            chalk.magentaBright('Gas quote Swap ') + // "Gas quote Swap" warna ungu cerah bersinar
            chalk.white('TPOL ') +               // "TPOL" warna putih
            chalk.yellow('to ') +                // "to" warna kuning
            chalk.white('WPOL: ') +              // "WPOL" warna putih
            chalk.green(unwrapGasFee)            // Code number warna hijau
        );
        

        const unwrapTx = await tpolContract.unwrap(
            amount,
            WALLET_ADDRESS,
            {
                gasPrice: GAS_PRICE
            }
        );
        console.log(
            chalk.hex('#800080')('[+]') + // Simbol warna ungu
            ' ' + chalk.white('Transaction Hash:') + // Teks putih
            ' ' + chalk.green(`${unwrapTx.hash}`) // Hash warna hijau
          );
          

        const unwrapReceipt = await unwrapTx.wait();
        console.log(
            chalk.magenta('[') +     // [ warna ungu
            chalk.red('✓') +         // ✓ warna merah
            chalk.magenta('] ') +    // ] warna ungu
            chalk.green('Swap Successfull!!') // "Swap Successfull!!" warna hijau
        );
        

        await delay(5000);
        await notifyTransaction(unwrapReceipt.hash, false, unwrapGasFee);

    } catch (error) {
        console.error(chalk.red(`[X] ${iteration + 1} failed:`, error));
    }
};

// Fungsi untuk mengambil total points
const getTotalPoint = async () => {
    try {
        const response = await fetch(`${APi_TOTAL_POINT}/${WALLET_ADDRESS}`, {
            headers: headers
        });
        const data = await response.json();

        if (response.status === 200) {
            console.log(
                '\n' +                                   // Baris baru sebelum simbol
                chalk.magenta('[') +                     // [ warna ungu
                chalk.red('✓') +                         // ✓ warna merah
                chalk.magenta('] ') +                    // ] warna ungu
                chalk.white('Total Points Balance: ') +          // Total Points: warna putih
                chalk.green(`${data.pointsAmount}`)      // Point amount warna hijau
            );
        } else {
            console.log(
                chalk.red(
                    `[X] Failed Check Point Response: ${response.status}, Response: ${JSON.stringify(data)}`
                )
            );
        }
    } catch (error) {
        console.error(chalk.red("\n[X] Failed Check Point error:", error));
    }
};

// Jalankan check-in pertama kali saat bot dimulai
(async () => {
    console.log(
        chalk.magenta('[') +
        chalk.red('➡️') + 
        chalk.magenta('] ') +
        chalk.red('ＢＯＴ ') +
        chalk.yellow('ＡＵＴＯ ') +
        chalk.green('ＳＷＡＰ ') +
        chalk.cyan('ＴＥＡＦＩ')
    );
    
    await dailyCheckIn();
})();