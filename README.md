# NVH Agri CRM - The "Good Enough" Solution

> *"It's not pretty, but it works" - Every farmer ever*

## 📊 What This Actually Is
A **bare-bones CRM** I built for my family's vetiver business because:
1. Notebooks get lost in the rain ☔
2. Excel crashes on mobile 📱
3. We needed something that *just works*

**Translation:** Basic CRUD app with Next.js + Supabase. No AI. No blockchain. Just forms and a database.

## 🎯 Why This Exists
| Problem | Old Way | This App |
|---------|---------|----------|
| Track customers | Paper notebook 📓 | Database 🗄️ |
| Record payments | Excel sheet 💀 | Web form 📝 |
| Generate receipts | MS Word 😴 | Auto-generate ⚡ |
| Mobile access | Carry laptop 🤦 | Phone browser 📱 |

## 🛠️ Tech Stack (The "Fancy" Words)
| What | Why I Used It | Reality |
|------|---------------|---------|
| **Next.js** | "It's popular" | Actually easy for basic pages |
| **TypeScript** | "Type safety" | I get red squiggles when I mess up |
| **Supabase** | "Backend as a service" | Free database, don't need to manage servers |
| **Tailwind CSS** | "Utility-first" | Copy-paste CSS from internet |
| **Vercel** | "Serverless deployment" | It's free and auto-deploys from GitHub |

## 🚀 "Deployment" (Fancy Word for Putting Online)
1. Write code → 2. Push to GitHub → 3. Vercel does magic → 4. **It's online!**
   
**Actual magic:** `git push` → 🪄 → https://nvh-agri-green-crm.vercel.app

## 📱 Mobile Experience
```typescript
const mobileExperience = {
  worksOn: ['iPhone', 'Android', 'That old Samsung your uncle has'],
  internetRequired: true,
  offlineMode: '😂 No',
  looksLike: 'A website on your phone',
  proTip: 'Add to home screen for app-like feel (kinda)'
};
``` 
## 🧑‍💻 For Developers Who Stumbled Here
Architecture (Using Small Words)
```
Browser → Next.js Pages → API Routes → Supabase → PostgreSQL
    ↑           ↑             ↑           ↑          ↑
   You        React       Serverless    Magic      Actual
              Magic        Functions    Sauce     Database
```
## ⚡ Running Locally

### 1. Clone this
```
git clone https://github.com/your-repo.git
```
### 2. Install stuff
```
npm install
```
### 3. Create .env.local (get keys from Supabase)
```
cp .env.local.example .env.local
```
### 4. Run
```
npm run dev
```

### 5. Open browser, hope it works
--- 

## 🤔 Why Not Use [Fancy SaaS Solution]?

**Cost:** They charge $50/month → This is free

**Complexity:** They have 100 features → We need 5

**Customization:** They say "no" → We say "yes"

**Data ownership:** Their cloud → Our database

## 🔮 Future "Features" (If I Get Time)
**SMS notifications** for payment reminders

**Basic reports** (more than just totals)

**Bulk import** (when Excel finally dies)

**Dark mode** (it's already dark, so... done?)

## 🆘 Support
**For bugs:** Try turning it off and on again

**For feature requests:** Add to the list above ⬆️

**For emergencies:** Use the paper notebook backup

## 📄 License
**"Don't steal, but learn from it" License**

Use for learning. Don't sell as your own. Give credit if you copy.

## 🙏 Acknowledgments
**Supabase** for free database

**Vercel** for free hosting

**Stack Overflow** for solving 99% of errors

**My family** for actually using this thing

Built with ❤️ and moderate frustration for a real vetiver business.

**P.S. If you're a "real" developer, you'll find 100 things wrong with this. That's okay - it works for us.**
