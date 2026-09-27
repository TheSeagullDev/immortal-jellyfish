<img width="1512" height="862" alt="image" src="https://github.com/user-attachments/assets/c65c660b-94d0-445c-b450-5f9004ea53a2" />
<div align="center">
<h1>MealWise</h1> 
</div>

## Inspiration
As Georgia Tech students, we are directly impacted by the lack of information regarding dining hall food: although there is a website listing the general foods present at each dining hall, it is simply not enough, as it doesn’t account for the day-to-day variety. 

We must make informed choices about which dining hall to eat at, since we are restricted by the number of meal swipes we can use, making each one count. This is even more significant for non-first-year students, since they do not have access to the easy-to-use first-year meal plans.

## What it does
Our website acts as a platform where Georgia Tech students can upload pictures and reviews of the food served at dining halls for the day. Fellow students can interact with others by liking other students’ reviews and uploading their own takes of the food. The website is inspired by many current social media networks (e.g., Instagram).

## How we built it
We built it as a SvelteKit site, styled with Tailwind, and we used Supabase for accounts, the database, and photo storage. Pages load data on the server, forms (e.g., new post, like, new profiles) post back to SvelteKit, and Supabase Postgres ensures the data the user inputs is valid (e.g., only @gatech.edu emails can sign up). The live site is the SvelteKit project, hosted on Vercel. When a user signs in, posts, or loads the feed, Vercel runs our code, which reads and writes the user’s data in Supabase for accounts, photos, and posts.

## Challenges we ran into
By utilizing Cursor, we frequently ran into formatting issues; specifically, Cursor kept adjusting parts of the website that did not need to be changed. In addition, our team’s overall lack of experience meant that we had to dedicate significant time working through tutorials.

## Accomplishments that we're proud of
Our team was able to seamlessly work together to create an idea tackling an issue that affects the majority of Georgia Tech students. We’re especially proud of the fact that we were able to learn so much regarding the concepts mentioned below in such a short span of time.

## What we learned
We learned the core concepts and functionality of JavaScript, GitHub, Gemini API, Supabase, Cursor, and Svelte. We learned how to keep UI, routes, and saved settings in sync, and we learned that changing one small thing often led to bugs in other places due to shared CSS or old data.

## What's next for MealWise
We can expand MealWise to other universities, as students in other institutions may face the same issue: limited information about the food served at dining halls on a specific day. We can add a page where students can select their university, which would prompt the website to update and display the dining halls for that university. 
