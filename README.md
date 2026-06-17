# Recovery Quest

https://recoveryquest.netlify.app/

---

So I made a health app. Kind of. It's more like... a game that also happens to track your health? Idk how to explain it let me just start from the beginning.

---

## Why I even made this

Okay so last year I was actually trying to get consistent with working out and eating better. Nothing crazy, just like — be healthier. So I downloaded like 5 different apps. MyFitnessPal, Strava, some sleep tracker, whatever.

And I used them for maybe 2 weeks.

Then I stopped. Not because I stopped caring, but because opening those apps felt like doing taxes. Log your food. Here's a pie chart. Okay bye. Like... that's it? That's the whole experience?

I'm a gamer. I've spent hundreds of hours grinding in games that are objectively just clicking buttons and watching numbers go up. But I LOVED it. Because the game made me feel like I was progressing. Every session mattered. Every action had feedback.

Why can't a health app feel like that?

So I built one that does.

---

## What it is

Recovery Quest is basically an RPG where you are the character and your daily habits are the stats.

Sleep well → your recovery stat goes up  
Eat decent → nutrition score improves  
Train consistently → performance score climbs  
All three together → your overall "Recovery Level" goes up

That's your character level. It's a real number that reflects how you've actually been living. Not how many steps you took today. Your actual consistency over time.

There's also streaks, XP-style progression, and an AI coach you can literally talk to. It's weird to describe but it just... works differently than other health apps I've tried.

---

## The features (okay I'll actually explain them)

**The dashboard** is your home screen and it shows everything at once — sleep, nutrition, training, recovery, all of it feeding into your level. I designed it to look like a game HUD. Took me way too long honestly but I think it paid off.

![dashboard](https://github.com/user-attachments/assets/a3fc1e01-ac67-4062-b19f-1e2c36946269)

---

**Nutrition tracking** is still logging food which like, I won't pretend is fun. But when you can see it affecting your actual recovery level it feels different. There's a reason to do it now.

![nutrition](https://github.com/user-attachments/assets/9082d8d9-97eb-4a67-b7b4-20cf56ba742d)

---

**Training module** — this one I'm genuinely proud of. You pick a split, browse exercises with actual instructions, log your sets and reps, and track consistency over time. And if you've been destroying yourself in the gym all week your recovery score actually drops and tells you to chill. I wish I had this when I was overtraining last year.

![training split](https://github.com/user-attachments/assets/55a4b455-6708-4c32-aca0-1c5b8814cc84)
![exercise library](https://github.com/user-attachments/assets/257ef5f8-28c3-471f-a89c-73f11f42d9a7)
![custom exercises](https://github.com/user-attachments/assets/298738c5-2ddb-4983-94d1-9e9cfb7b9ce3)
![logging sets](https://github.com/user-attachments/assets/4eef9f94-6718-42ed-9b8f-8e6a7eb1b497)
![training overview](https://github.com/user-attachments/assets/63617a3c-6332-4a80-a92e-2cd95ddc3082)

---

**Recovery system** looks at your fatigue index, sleep consistency, estimated HRV, resting heart rate and spits out an actual recommendation. Not a number. An actual "hey you should probably take it easy today" or "you're recovered, push hard." There's even built in breathing exercises which sounds cringe but is genuinely useful on rest days.

![recovery system](https://github.com/user-attachments/assets/46ccbdec-c5ce-4fd2-9c99-d5b13241f3b8)


**Memory map** is kinda different from everything else. You take a photo every day, it stores it on a timeline, and you can generate a little video from any date range you pick. So over time you can literally watch yourself change. Numbers don't capture everything and I wanted something that did.
![recovery details](https://github.com/user-attachments/assets/0865816e-b523-49cf-aa70-ada29d989fd5)

---

**AI coach** is exactly what it sounds like. You can just... talk to it. Ask it stuff. "Should I train today?" "What does my recovery score mean?" "Why do I feel so tired?" It knows your data so the answers are actually relevant to you specifically. This was the feature that tied the whole thing together for me.
![memory map](https://github.com/user-attachments/assets/d33bd5f3-8dd1-409f-bab8-0477521b6030)

**Meet Team** Meet me!
![ai coach](https://github.com/user-attachments/assets/55ad6a2f-a598-4d08-8aca-66da5b2ef6cb)

---

## The tech stack

Vanilla HTML, CSS, and JavaScript. No frameworks, no backend, no database. Everything lives in local storage. I kept it simple on purpose — I didn't want to spend 80% of my time setting up infrastructure for a personal project. The AI integration handles the smart stuff.

---

## How AI helped me build it

Gonna be transparent here because I think it's actually worth talking about.

During development, I used AI-assisted tools to help with brainstorming ideas, writing boilerplate code, squashing bugs, and improving documentation. But here’s the key: I treated everything the AI generated as a rough draft, not a final product. Every suggestion was manually reviewed, adapted to fit my project’s specific context, and thoroughly tested before I integrated it. AI was a helpful assistant—great for handling repetitive tasks or offering a fresh perspective—but I made all the design decisions, architectural choices, and creative calls myself.
---

## How to use it

Go to the site, make a profile, start logging. Check your dashboard. Talk to the coach when you're lost. Don't break your streak. Level up.

That's genuinely it.

---

## What's next

I want to add achievements and badges, a leaderboard so you can compete with friends, audio guided recovery sessions, and eventually some kind of social accountability thing. Basically: make it feel even more like a game.

---

## The real reason I built this

I like programming and I like games and for a long time those felt like two separate things. This project was me figuring out that they don't have to be.

I also just actually wanted the app to exist. I wanted to use it. And building something you actually use yourself is a completely different feeling from building something for a grade or a portfolio.

If you try it out and it helps you stay consistent even a little bit, that's everything to me honestly.

> Your life is already a game. Might as well start playing it properly.
