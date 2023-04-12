---
layout: page
title: Skills & Certifications
permalink: /skills/
weight: 2
---

<div class="row">
{% include about/skills.html title="Programming Skills" source=site.data.programming-skills %}
{% include about/skills.html title="Other Skills" source=site.data.other-skills %}
<!-- {% include about/skills.html title="Tools" source=site.data.tools %} -->
</div>

<h2 class="mb-3">Certifications</h2>

{% capture list_items %}
IBM Certified Professional Architect - Cloud v5
IBM Cloud Satellite v1 Specialty
IBM Certified Professional Sales Engineer - Cloud v1
IBM Technology Excellence
IBM Data Science Professional Certificate
IBM Cloud Pak for Data
IBM Cloud Pak for Integration
Blockchain Consulting
IBM Solutions for Red Hat OpenShift and IBM Cloud Paks
Red Hat OpenShift Administration I
{% endcapture %}
{% include elements/list.html %}

More certifications and Badges can be viewed at my <a href="https://www.credly.com/users/m-fawaz-siddiqi" target="_blank">Credly</a>
