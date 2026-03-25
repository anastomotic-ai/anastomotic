<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">中文</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.ru.md">Русский</a> | <a href="README.es.md">Español</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.ar.md">العربية</a> | <a href="README.id.md">Bahasa Indonesia</a> | <a href="README.ta.md">தமிழ்</a> | <strong>हिन्दी</strong>
</p>

# Anastomotic™ - ओपन सोर्स AI डेस्कटॉप एजेंट

Anastomotic एक ओपन सोर्स AI डेस्कटॉप एजेंट है जो आपकी मशीन पर लोकल तौर पर फ़ाइल मैनेजमेंट, डॉक्यूमेंट क्रिएशन और ब्राउज़र टास्क को ऑटोमेट करता है। अपनी खुद की API कीज़ (OpenAI, Anthropic, Google, xAI) लाएँ या Ollama के ज़रिए लोकल मॉडल चलाएँ।

<p align="center">
  <strong>आपकी मशीन पर लोकल तौर पर चलता है। अपनी खुद की API कीज़ या लोकल मॉडल लाएँ। MIT लाइसेंस्ड।</strong>
</p>

<p align="center">
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-arm64.dmg"><strong>Mac (Apple Silicon) के लिए डाउनलोड करें</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-x64.dmg"><strong>Mac (Intel) के लिए डाउनलोड करें</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/windows/Anastomotic-0.4.8-win-x64.exe"><strong>Windows 11 के लिए डाउनलोड करें</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-arm64.AppImage"><strong>Linux (ARM64) के लिए डाउनलोड करें</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-x86_64.AppImage"><strong>Linux (x64) के लिए डाउनलोड करें</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-amd64.deb"><strong>Linux (.deb x64) के लिए डाउनलोड करें</strong></a>
  ·
  <a href="https://www.anastomotic.ai/">Anastomotic वेबसाइट</a>
  ·
  <a href="https://www.anastomotic.ai/blog/">Anastomotic ब्लॉग</a>
  ·
  <a href="https://github.com/RajdeepKushwaha5/accomplish/releases">Anastomotic रिलीज़</a>
</p>

<br />

---

<br />

## क्या इसे अलग बनाता है

<table>
<tr>
<td width="50%" valign="top" align="center">

### 🖥️ यह स्थानीय रूप से चलता है

<div align="left">

- आपकी फ़ाइलें आपकी मशीन पर रहती हैं
- आप तय करते हैं कि यह किन फ़ोल्डरों को छू सकता है
- कुछ भी Anastomotic (या किसी और) को नहीं भेजा जाता है

</div>

</td>
<td width="50%" valign="top" align="center">

### 🔑 आप अपनी खुद की AI लाते हैं

<div align="left">

- अपनी स्वयं की API कुंजी (OpenAI, Anthropic, आदि) का उपयोग करें
- या [Ollama](https://ollama.com) के साथ चलाएं (कोई API कुंजी की आवश्यकता नहीं)
- कोई सदस्यता नहीं, कोई अपसेल नहीं
- यह एक उपकरण है—सेवा नहीं

</div>

</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">

### 📖 यह ओपन सोर्स है

<div align="left">

- कोड की हर पंक्ति GitHub पर है
- MIT लाइसेंस प्राप्त
- इसे बदलें, इसे फोर्क करें, इसे तोड़ें, इसे ठीक करें

</div>

</td>
<td width="50%" valign="top" align="center">

### ⚡ यह कार्य करता है, केवल चैट नहीं करता

<div align="left">

- फ़ाइल प्रबंधन
- दस्तावेज़ निर्माण
- कस्टम स्वचालन
- कौशल सीखना

</div>

</td>
</tr>
</table>

<br />

---

<br />

## यह वास्तव में क्या करता है

|                                                                                                     |                                                                                       |                                                                                     |
| :-------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------- |
| **📁 फ़ाइल प्रबंधन**                                                                                | **✍️ दस्तावेज़ लेखन**                                                                 | **🔗 टूल कनेक्शन**                                                                  |
| आपके द्वारा दी गई सामग्री या नियमों के आधार पर फ़ाइलों को सॉर्ट करें, नाम बदलें और स्थानांतरित करें | दस्तावेज़ लिखने, सारांशित करने या फिर से लिखने के लिए इसे संकेत दें                   | Notion, Google Drive, Dropbox और अधिक (स्थानीय API के माध्यम से) के साथ काम करता है |
|                                                                                                     |                                                                                       |                                                                                     |
| **⚙️ कस्टम कौशल**                                                                                   | **🛡️ पूर्ण नियंत्रण**                                                                 |                                                                                     |
| दोहराए जाने वाले वर्कफ़्लो को परिभाषित करें, उन्हें कौशल के रूप में सहेजें                          | आप हर कार्रवाई को अनुमोदित करते हैं। आप लॉग देख सकते हैं। आप इसे कभी भी रोक सकते हैं। |                                                                                     |

<br />

## उपयोग के मामले

- प्रोजेक्ट, फ़ाइल प्रकार, या दिनांक के अनुसार गन्दे फ़ोल्डरों को साफ़ करें
- दस्तावेज़, रिपोर्ट, और मीटिंग नोट्स का ड्राफ़्ट, सारांशित करें और फिर से लिखें
- शोध और फ़ॉर्म प्रविष्टि जैसे ब्राउज़र वर्कफ़्लो को स्वचालित करें
- फ़ाइलों और नोट्स से साप्ताहिक अपडेट जेनरेट करें
- दस्तावेज़ों और कैलेंडर से मीटिंग सामग्री तैयार करें

<br />

## समर्थित मॉडल और प्रदाता

- Anthropic (Claude)
- OpenAI (GPT)
- Google AI (Gemini)
- xAI (Grok)
- DeepSeek
- Moonshot AI (Kimi)
- Z.AI (GLM)
- MiniMax
- Venice.ai
- Amazon Bedrock
- Azure Foundry
- OpenRouter
- LiteLLM
- Ollama (स्थानीय मॉडल)
- LM Studio (स्थानीय मॉडल)

<br />

## गोपनीयता और स्थानीय-प्रथम

Anastomotic आपकी मशीन पर स्थानीय रूप से चलता है। आपकी फ़ाइलें आपके डिवाइस पर रहती हैं, और आप चुनते हैं कि वह किन फ़ोल्डरों तक पहुँच सकता है।

<br />

## सिस्टम आवश्यकताएँ

- macOS (Apple Silicon)
- Windows 11
- Ubuntu (ARM64)
- Ubuntu (x64)

<br />

---

<br />

## इसका उपयोग कैसे करें

> **सेट अप करने में 2 मिनट लगते हैं।**

|  चरण  | कार्रवाई                   | विवरण                                                                                                                                    |
| :---: | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **ऐप इंस्टॉल करें**        | DMG डाउनलोड करें और इसे Applications में खींचें                                                                                          |
| **2** | **अपने AI को कनेक्ट करें** | अपनी स्वयं की Google, OpenAI, Anthropic (या अन्य) API कुंजी का उपयोग करें — या ChatGPT (Plus/Pro) के साथ साइन इन करें। कोई सदस्यता नहीं। |
| **3** | **इसे एक्सेस दें**         | चुनें कि वह कौन से फ़ोल्डर देख सकता है। आप नियंत्रण में रहें।                                                                            |
| **4** | **काम करना शुरू करें**     | इसे एक दस्तावेज़ का सारांश देने, एक फ़ोल्डर साफ़ करने, या एक रिपोर्ट बनाने के लिए कहें। आप सब कुछ अनुमोदित करते हैं।                     |

<br />

<br />

<div align="center">

[**Mac (Apple Silicon) के लिए डाउनलोड करें**](https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-arm64.dmg) · [**Mac (Intel) के लिए डाउनलोड करें**](https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-x64.dmg) · [**Windows 11 के लिए डाउनलोड करें**](https://downloads.anastomotic.ai/downloads/0.4.8/windows/Anastomotic-0.4.8-win-x64.exe) · [**Linux (ARM64) के लिए डाउनलोड करें**](https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-arm64.AppImage) · [**Linux (x64) के लिए डाउनलोड करें**](https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-x86_64.AppImage) · [**Linux (.deb x64) के लिए डाउनलोड करें**](https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-amd64.deb)

</div>

<br />

---

<br />

<br />

## सामान्य प्रश्न

**क्या Anastomotic स्थानीय रूप से चलता है?**
हाँ। Anastomotic आपकी मशीन पर स्थानीय रूप से चलता है और आप नियंत्रित करते हैं कि वह किन फ़ोल्डरों तक पहुँच सकता है।

**क्या मुझे API कुंजी की आवश्यकता है?**
आप अपनी स्वयं की API कुंजियों (OpenAI, Anthropic, Google, xAI, आदि) का उपयोग कर सकते हैं या Ollama के माध्यम से स्थानीय मॉडल चला सकते हैं।

**क्या Anastomotic मुफ़्त है?**
हाँ। Anastomotic ओपन सोर्स और MIT लाइसेंस प्राप्त है।

**कौन से प्लेटफ़ॉर्म समर्थित हैं?**
macOS (Apple Silicon) और Windows 11 अब उपलब्ध हैं। Ubuntu (ARM64) और Ubuntu (x64) भी समर्थित हैं।

<br />

---

<br />

## विकास

```bash
pnpm install
pnpm dev
```

बस इतना ही।

<details>
<summary><strong>पूर्वापेक्षाएँ</strong></summary>

- Node.js 20+
- pnpm 9+

</details>

<details>
<summary><strong>सभी कमांड</strong></summary>

| कमांड                                        | विवरण                                   |
| -------------------------------------------- | --------------------------------------- |
| `pnpm dev`                                   | डेस्कटॉप ऐप को डेव मोड में चलाएँ        |
| `pnpm dev:clean`                             | क्लीन स्टार्ट के साथ डेव मोड            |
| `pnpm build`                                 | सभी वर्कस्पेस बनाएँ                     |
| `pnpm build:desktop`                         | केवल डेस्कटॉप ऐप बनाएँ                  |
| `pnpm -F @anastomotic/desktop package:win`   | Windows इंस्टॉलर बनाएं (x64)            |
| `pnpm -F @anastomotic/desktop package:linux` | Linux आर्टिफैक्ट बनाएं (AppImage + deb) |
| `pnpm lint`                                  | TypeScript जाँच                         |
| `pnpm typecheck`                             | प्रकार सत्यापन                          |
| `pnpm -F @anastomotic/desktop test:e2e`      | Playwright E2E परीक्षण                  |

</details>

<details>
<summary><strong>पर्यावरण चर</strong></summary>

| चर                | विवरण                                       |
| ----------------- | ------------------------------------------- |
| `CLEAN_START=1`   | ऐप शुरू होने पर सभी संग्रहीत डेटा साफ़ करें |
| `E2E_SKIP_AUTH=1` | ऑनबोर्डिंग प्रवाह छोड़ें (परीक्षण के लिए)   |

</details>

<details>
<summary><strong>आर्किटेक्चर</strong></summary>

```text
apps/
  desktop/        # इलेक्ट्रॉन ऐप (मुख्य + प्रीलोड + रेंडरर)
packages/
  shared/         # साझा TypeScript प्रकार
```

डेस्कटॉप ऐप Vite के माध्यम से बंडल किए गए React UI के साथ Electron का उपयोग करता है। मुख्य प्रक्रिया कार्यों को निष्पादित करने के लिए `node-pty` का उपयोग करके [OpenCode](https://github.com/sst/opencode) CLI को चलाती है। API कुंजियाँ OS कीचेन में सुरक्षित रूप से संग्रहीत की जाती हैं।

विस्तृत आर्किटेक्चर प्रलेखन के लिए [CLAUDE.md](CLAUDE.md) देखें।

</details>

<br />

---

<br />

## योगदान

योगदान का स्वागत है! बेझिझक एक PR खोलें।

```bash
# Fork → Clone → Branch → Commit → Push → PR
git checkout -b feature/amazing-feature
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
```

<br />

---

<br />

<div align="center">

**[Anastomotic वेबसाइट](https://www.anastomotic.ai/)** · **[Anastomotic ब्लॉग](https://www.anastomotic.ai/blog/)** · **[Anastomotic रिलीज़](https://github.com/RajdeepKushwaha5/accomplish/releases)** · **[Issues](https://github.com/RajdeepKushwaha5/accomplish/issues)** · **[Twitter](https://x.com/ANASTOMOTIC_ai)**

<br />

MIT लाइसेंस · [Anastomotic](https://www.anastomotic.ai) द्वारा निर्मित

<br />

**कीवर्ड:** AI एजेंट, AI डेस्कटॉप एजेंट, डेस्कटॉप ऑटोमेशन, फ़ाइल मैनेजमेंट, डॉक्यूमेंट क्रिएशन, ब्राउज़र ऑटोमेशन, लोकल-फ़र्स्ट, macOS, प्राइवेसी-फ़र्स्ट, ओपन सोर्स, Electron, कंप्यूटर यूज़, AI असिस्टेंट, वर्कफ़्लो ऑटोमेशन, OpenAI, Anthropic, Google, xAI, Claude, GPT-4, Ollama

</div>
