---
title: "Java 8 Isn't Going Away Tomorrow, but Your Excuses Are"
description: "A Sustain, Modernize, Innovate playbook for enterprise Java"
tags: [Java, Modernization, Architecture, Cloud]
image: /assets/img/blog/2026-10-13-java-8-sustain-modernize-innovate.jpg
---

Ask almost any large enterprise what its most important applications run on, and Java will usually be part of the answer. More than 90% of Fortune 500 companies use Java for enterprise software. Java has kept that position because it scales, it has a huge talent pool, and it runs almost anywhere.

Many of those applications have a problem, though: they still run on **Java 8 or older**.

## The risk you don't see

Java 8 applications rarely break all at once. The risk builds slowly. Popular open-source frameworks such as Spring Boot 2.7 and Apache Struts no longer release community security updates for older versions, even though many critical applications depend on them. Each unpatched library becomes a possible way in for attackers, who look for known vulnerabilities in unsupported software.

The second cost is less visible. Technical debt consumes a large share of developer time, which goes to keeping old systems running when it could go to features the business is asking for.

## Why it hasn't been fixed yet

Most teams know about the problem. They haven't fixed it because migrating is slow, expensive and disruptive, and teams are already stretched. Many WebSphere estates also had no easy route to Java 17+ until recently. Rewriting everything isn't realistic, and doing nothing becomes riskier every year.

The way out is to stop treating this as one decision. Make it a **decision per application**.

## The three-lane framework

Every application in your portfolio belongs in one of three lanes.

### Lane 1: Sustain (secure what you won't modernize)

Some applications are stable, rarely changed or due to be retired. Rewriting them isn't worth it, but leaving them exposed isn't acceptable either.

For these apps, the goal is to **keep them supported**. Commercial library support for end-of-life frameworks such as Spring, Struts and Hibernate provides drop-in security fixes, so you get security and compliance without a rewrite. Moving to a supported OpenJDK distribution can also cut Java licensing costs significantly compared with proprietary options.

> **Use this lane when:** the app works, rarely changes, and has a retirement date in the next few years.

### Lane 2: Modernize (move critical apps forward with automation)

Your business-critical applications that keep evolving belong here. The old objection to modernizing was effort. Automation has largely removed it.

Modern assessment tools scan your whole application estate. They map dependencies on databases and queues, and they sort each application into one of three groups:

- **Simple:** no code changes needed
- **Moderate:** some well-understood fixes needed
- **Complex:** may need re-architecture or should stay as-is for now

Start with the simple group. Quick wins build momentum and credibility.

AI coding assistants now help with the work in between. They can explain unfamiliar legacy code, apply fixes that have no automated rule, generate test cases to validate the migration, and write documentation for code nobody has documented.

You also don't need to change how you operate. Some approaches let teams run Java 17 and Jakarta EE 10 applications next to existing Java 8 apps, using the same admin consoles and scripts they already know. In short, you can modernize Java *without modernizing everything else at the same time*.

> **Use this lane when:** the app is critical, actively developed, and held back by its runtime.

### Lane 3: Innovate (build new apps cloud-native from day one)

New applications shouldn't add to tomorrow's technical debt. For new work, the main choice is between two modern runtimes:

| Choose a Jakarta EE runtime such as Liberty when… | Choose a cloud-native framework such as Quarkus when… |
|---|---|
| You're modernizing existing Jakarta EE apps | You're building new apps on Kubernetes or OpenShift |
| You need long-term API stability | Your developers prioritize fast iteration |
| Your estate includes WebSphere, WebLogic or Tomcat | You need fast startup and a small memory footprint |
| Your ops team needs enterprise admin tooling | Your workloads are event-driven or use AI |

Both options run on-premises or in the cloud, and both are built for containers.

> **Use this lane when:** you're building something new, especially if it's cloud-native or uses AI.

## What the results look like

This isn't just theory. Public case studies show what organizations have achieved:

- **[SOMPO Holdings](https://www.ibm.com/case-studies/sompo-holdings)** modernized with WebSphere Liberty and reported a **54% reduction in CPU cores** and a **33% reduction in memory**, while managing 100+ servers with minimal staff.
- **[A government agency in Morocco](https://www.ibm.com/case-studies/govt-dept-in-morocco)**, working with PowerM, reported a **92% reduction in licensing costs** alongside 100% availability.
- **[FlowFactor](https://www.ibm.com/case-studies/flowfactor)** reported modernizing **65 applications** and cutting per-app modernization time **from up to a month to about an hour**.

Results will vary by environment, but the pattern holds: modernizing in small, automated steps pays off far faster than a "big bang" rewrite.

## A 5-question self-assessment

Before your next planning cycle, answer these honestly:

1. Do you know how many of your applications still run on Java 8 or earlier?
2. Which of them depend on frameworks that no longer get security fixes?
3. For each app, is the right lane Sustain, Modernize or Innovate, and who decided?
4. Has your team run an automated assessment of the estate, or is the plan based on guesswork?
5. Are your new applications being built on runtimes that will still be supported in five years?

If you couldn't answer two or more of these with confidence, you've found where to start.

## The bottom line

Java 8 won't disappear tomorrow, but the cost of staying on it rises every quarter in security exposure, developer time and missed opportunities. You don't need to fix everything at once. Sort your apps into lanes, secure what you'll keep as-is, automate what you'll move, and build new work on a modern foundation.

*How is your organization handling its Java 8 estate? I'd like to hear what's working, and what isn't.*

---

*The views in this post are my own.*
