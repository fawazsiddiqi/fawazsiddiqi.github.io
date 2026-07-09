---
layout: page
title: About
permalink: /about/
weight: 1
---

# **About Me**

I am **{{ site.author.name }}**, a solution architect.<br>
I work on application modernization, integration, and microservices, which mostly means translating a business problem into a system somebody can actually build, staff, and pay for. The interesting constraints are rarely technical. They're the existing vendor contract, the team you have rather than the team you'd like, and the six weeks before the thing needs to be in front of a customer.

I came to this through building. Web, frontend, backend, and data systems, enough of each that I'm suspicious of designs that look clean in a slide and expensive on a Tuesday at 3am. It also means when I tell a client something is feasible, I know what I'm committing their engineers to. That credibility is most of the job. The rest is asking the question nobody has asked yet, usually some version of "what happens to this data when the integration fails."

I also work on digital transformation and IT strategy with teams and startups. The useful version of that isn't a roadmap deck. It's sitting with a founder who has four priorities and finding out which one is real, then designing something that gets to production without collapsing the first time it meets an actual user.

<div class="row">
{% include about/timeline.html title="Work Experience" source=site.data.timeline %}
</div>

<div class="row">
{% include about/education.html title="Education" source=site.data.education %}
</div>

<div class="row">
{% include about/highlights.html title="Career Highlights" source=site.data.highlights %}
</div>

<div class="row">
{% include about/mentor.html title="Mentorship & Participations" source=site.data.mentor %}
</div>
