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
IBM Cloud Pak for Data
IBM Cloud Pak for Applications
Watson Studio
Watson Assistant
Watson Discovery
Watson Knowledge Catalog
Blockchain Consulting
IBM Solutions for Red Hat OpenShift and IBM Cloud Paks
Introduction to Containers Kubernetes & Redhat OpenShift
Red Hat OpenShift Administration I
IBM Data Science Professional Certificate
{% endcapture %}
{% include elements/list.html %}

More certifications and Badges can be viewed at my <a href="https://www.youracclaim.com/users/m-fawaz-siddiqi/badges" target="_blank">YourAcclaim</a>