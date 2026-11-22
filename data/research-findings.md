# Analysis techniques: what exists, what is used and what has been tested

## In short

This report summarises the research behind the catalogue of 236 analysis techniques. It covers which techniques exist, what evidence supports them, how widely they are used and what the research did not cover. It combines two reports on techniques, one for desk research on any topic and one for text and data, with surveys and interviews on technique use and the frameworks that consultancies publish.

The analysis part of the catalogue has 236 techniques in 12 families. Of these, 33 have a published study of their effect or accuracy, 150 are described without a test, 13 are used in practice with no published description found, and 40 have no source that could be opened. The tests are mostly of techniques whose output can be scored, such as forecasting, text classification and checks on model output. None of the 11 techniques for combining sources has a test. Two experiments on analysis of competing hypotheses found no accuracy gain.

The most used techniques in the surveys are SWOT (strengths, weaknesses, opportunities, threats) at nearly 80 per cent of 2,148 UK business school alumni, brainstorming at 91.2 per cent of Ontario government analysts, and interview at 89 per cent of Ukrainian business analysts. The least used are specialised or quantitative, such as Markov chain modelling at 0.8 per cent of analysts. No technique has both a use figure and a measured accuracy figure, so the research cannot say whether widely used techniques give better results.

Practitioners use a handful of tools at a time. Consultancies publish named frameworks under their own brands and report wide use of them, and no independent count was found. The catalogue has gaps: five families were not extended to text and data, and many named methods for data, text and combining sources are missing because no source describing them could be opened.

A third report added 68 techniques for combining findings and reporting the answer, which steps 7 and 8 use. Of these, 22 have a published test, 42 are documented and 4 are unconfirmed. Nine of the 13 that were first unconfirmed were later confirmed from sources that opened. The findings in this report describe the 236 analysis techniques. The list at the end covers all 304.

## What the research shows

### 1. What techniques exist

The analysis part of the catalogue has 236 techniques in 12 families: eight for desk research on any topic and four added for text and data. The largest family is trace cause and test claims, with 34 techniques, and the smallest is frame the question, with 6. Among the techniques added for text and data, checking extracted results is the largest family, with 29 of 84. Desk evidence alone is enough for 100 of the first 150 techniques. Detail: findings 1.1 to 1.4.

### 2. What has been tested

Of the 236 techniques, 33 have a published study of their effect or accuracy. The tests are mostly of techniques whose output can be scored, and none of the 11 techniques for combining sources has a test. SWOT, Porter's Five Forces, Cynefin and Wardley maps are widely used, and the research found no controlled study of their effect. Two experiments on analysis of competing hypotheses found no accuracy gain, and the largest reported gains are for forecasting methods. Language model reliability varies by task. The reports conclude that checks built into the procedure matter more than the choice of technique. Detail: findings 2.1 to 2.8.

### 3. What is used most and least

SWOT is the most used tool in the strategy surveys, at nearly 80 per cent of 2,148 UK business school alumni. Brainstorming is first among Ontario government analysts, at 91.2 per cent, and interview is first among Ukrainian business analysts, at 89 per cent. The least used techniques are specialised or quantitative, such as Markov chain modelling at 0.8 per cent of analysts. Managers in the alumni survey used one to nine tools, and four was the most common number. A consultancy survey shows the average falling from 16.1 tools in 2002 to 7.0 in 2014. Interviews with consultants describe a small toolkit that is adapted to the client and used as support for the work. Detail: findings 3.1 to 3.5.

### 4. How use differs

Each kind of work has its own leading techniques: SWOT in strategy, brainstorming and consultation in policy, interview and document analysis in business analysis. In policy work, consultants used focus groups, modelling tools and Monte Carlo techniques more than government analysts, and used checklists and brainstorming less. In the alumni survey SWOT was the most used tool and was not among the most valued. Detail: findings 4.1 to 4.3.

### 5. Where named frameworks come from

Consulting firms publish named frameworks and tools. McKinsey lists classic frameworks by decade, including the 9-box matrix, 7-S, three horizons and the consumer decision journey. BCG published the growth share matrix in 1968. Bain published the Net Promoter Score in 2003, the 30 Elements of Value and The Founder's Mentality, and has run a management tools survey since 1993. PwC's Strategy& publishes Capabilities-Driven Strategy. Management scholars describe consultants as fashion setters who package and spread management ideas. No tool exists for appraising sponsored surveys. Detail: findings 5.1 to 5.4.

### 6. What the catalogue does not cover

Five of the twelve families were not extended to text and data. Common methods for structured data and for existing reports are missing, as are many named methods for text and for combining sources, because no source describing them could be opened. Four terms from earlier work are not established technique names. No published procedure exists for combining sources that share no identifier. Detail: findings 6.1 to 6.5.

The use figures come from self-reported surveys and interviews, so they show patterns and not exact rates.

## The evidence in detail

This section has 29 findings in 6 groups. Each group is one of the 6 themes above, and its findings are numbered from 1.1.

1. What techniques exist (findings 1.1 to 1.4)
2. What has been tested (findings 2.1 to 2.8)
3. What is used most and least (findings 3.1 to 3.5)
4. How use differs (findings 4.1 to 4.3)
5. Where named frameworks come from (findings 5.1 to 5.4)
6. What the catalogue does not cover (findings 6.1 to 6.5)

Each finding gives what the sources report and ends with one caveat about the source.

### 1. What techniques exist

#### 1.1 The analysis part of the catalogue has 236 techniques in 12 families.

The first eight families are for desk research on any topic: frame the question (6), decompose and map (21), compare (17), trace cause and test claims (34), handle evidence (29), project forward (25), assess actors, options and risks (19) and challenge (15). Four families were added for text and data: prepare and extract (14), measure and model (16), integrate across sources (11) and check extracted results (29). Fifteen text and data techniques fit the first eight families and are counted there.

The families are the catalogue's own grouping by what a technique does, because no source supplies one.

#### 1.2 The text and data techniques work on three kinds of input.

Of the 84 techniques added for text and data, 57 work on unstructured text, 37 on structured data and 24 on existing reports. Thirty-one accept more than one kind of input.

The counts add to more than 84 because a technique is counted under each input it accepts.

#### 1.3 Checking extracted results is the largest family among the text and data techniques.

The family has 29 of the 84 techniques. A model or script that performs an extraction step creates a need to measure its error. Most of the checks come from older statistical practice: agreement coefficients, gold-standard samples, false discovery control and leakage checks. The checks specific to language model output are repeated-run tests, prompt stability scores, specification sweeps, entailment checks, sampling-consistency detection, judge models and calibration.

The reason given is the report's inference.

#### 1.4 Desk evidence alone is enough for 100 of the first 150 techniques.

Of the first 150 techniques, 45 need expert judgement or other inputs that desk sources only partly supply, and 5 need people or data that desk research cannot create. Of the 84 text and data techniques, one can be done by a model alone, 54 need code and 29 need human judgement.

The fit ratings are mostly inference from the sources.

### 2. What has been tested

#### 2.1 Most techniques have a description but no test of their effect.

Of the 236 techniques, 33 are tested, meaning at least one published study measured the effect or accuracy. 150 are documented, meaning a text, guidance or summary describes them without a test. 13 are practice, meaning they are used with no published description found. 40 are unconfirmed, meaning no source was opened or a source failed to load. A status of documented, practice or unconfirmed means no study was found. It does not mean the technique was tested and found ineffective.

| Family | Techniques | Tested | Documented | Practice | Unconfirmed |
|:-|-:|-:|-:|-:|-:|
| Frame the question | 6 | 0 | 2 | 3 | 1 |
| Decompose and map | 21 | 0 | 15 | 2 | 4 |
| Compare | 17 | 1 | 12 | 0 | 4 |
| Trace cause and test claims | 34 | 5 | 20 | 3 | 6 |
| Handle evidence | 29 | 0 | 18 | 1 | 10 |
| Project forward | 25 | 5 | 9 | 0 | 11 |
| Assess actors, options and risks | 19 | 0 | 17 | 1 | 1 |
| Challenge | 15 | 0 | 12 | 2 | 1 |
| Prepare and extract | 14 | 5 | 9 | 0 | 0 |
| Measure and model | 16 | 7 | 9 | 0 | 0 |
| Integrate across sources | 11 | 0 | 10 | 0 | 1 |
| Check extracted results | 29 | 10 | 17 | 1 | 1 |
| **All families** | **236** | **33** | **150** | **13** | **40** |

The report on desk research counted studies of effect only. The report on text and data also counted studies of accuracy and reliability.

#### 2.2 Tests exist mostly where output can be scored.

Tests exist in 3 of the 8 original families: compare (1), trace cause and test claims (3) and project forward (5). The clearest positive results are for forecasting, where outcomes can be scored. In the text and data techniques, text classification and coding are tested most often because they can be scored against human labels. None of the 11 techniques for combining sources has a test, and no opened study tests a language model on those steps.

Status was assigned from abstracts and secondary pages for most studies.

#### 2.3 Widely used techniques such as SWOT have no controlled study of their effect.

The research found no controlled study of effect for the SWOT matrix, Porter's Five Forces, Cynefin or Wardley maps, although all four are widely used. Critiques of two other techniques are analytical and not experimental. A peer-reviewed commentary finds no evidence of effectiveness for the five whys, and Cox (2008) found that typical risk matrices reliably compare under 10 per cent of random hazard pairs.

A study may exist that the search did not reach.

#### 2.4 Two experiments on analysis of competing hypotheses found no accuracy gain.

In the study of 50 intelligence analysts the mean absolute error was 0.21 for controls and 0.26 for the technique group (p = .14, not significant). A second experiment with graduate-level civilian participants found the technique group slightly less reliable (p = .051, d = 0.20).

Sources: Strathclyde record of the study of 50 intelligence analysts (https://strathprints.strath.ac.uk/69049/); Cambridge Core paper reporting the error figures (https://cambridge.org/core/services/aop-cambridge-core/content/view/1530E9DAE8F42B2E8FC2B5FE374DB50F/S1930297500006628a.pdf/boosting-intelligence-analysts-judgment-accuracy-what-works-what-fails.pdf); Karvetski and Mandel (2020), Cambridge Core (https://cambridge.org/core/services/aop-cambridge-core/content/view/9ED40E4658EE77914D2C7A265154B59A/S1930297500008159a.pdf/coherence-of-probability-judgments-from-uncertain-evidence-does-ach-help.pdf)

Both experiments come from one research group, and the samples are small.

#### 2.5 Forecasting methods show the largest reported accuracy gains.

Good Judgment Project forecasters beat a control group by 60 per cent in year 1 and 78 per cent in year 2, teams were 23 per cent more accurate than individuals, and a training module under one hour improved Brier scores by 6 to 11 per cent. A separate review found that prediction markets generally beat moderately sophisticated benchmarks.

Sources: AI Impacts, summary of Good Judgment Project research (https://aiimpacts.org/?p=1260); Wolfers and Zitzewitz (2004), Prediction Markets (https://www.aeaweb.org/articles?id=10.1257/0895330041371321).

The Good Judgment figures come from a blog summary.

#### 2.6 Language model reliability depends on the task.

Across 13 million labels from 18 models, about 31 per cent of tested hypotheses reached wrong conclusions. On RADAR, a table-question benchmark, one model fell from 83 per cent on clean tables to 32 per cent on logically inconsistent ones.

Sources: Baumann et al. 2025 (https://arxiv.org/abs/2509.08825); RADAR (https://arxiv.org/pdf/2506.08249).

The studies date from 2023 to 2025 and may not describe current models.

#### 2.7 Arithmetic checks find inconsistencies in about half of the articles that report results in a standard format.

Across 30,717 articles, statcheck found at least one inconsistency in 49.6 per cent of those that reported results in the American Psychological Association style. A pilot of the ROBIS instrument for appraising reviews gave 65 per cent agreement between two reviewers.

Sources: Nuijten et al., Behavior Research Methods 2016 (https://rd.springer.com/content/pdf/10.3758/s13428-015-0664-2.pdf); ROBIS, Journal of Clinical Epidemiology (https://eprints.whiterose.ac.uk/132646/1/1_s2.0_S089543561500308X_main.pdf).

The ROBIS figure is from one pilot.

#### 2.8 Checks built into the procedure matter more than the choice of technique.

The reports conclude that the quality of a desk analysis depends mainly on checks built into the procedure, because measured effects exist for so few techniques. The techniques with such a check have an outcome that can be resolved, such as scoring forecasts or comparing an extrapolation with a naive no-change forecast. A researcher who picks a text or table technique also needs a validation technique.

This is the reports' inference from the pattern of tests.

### 3. What is used most and least

#### 3.1 SWOT, brainstorming and interviews lead in their kinds of work.

SWOT analysis is the most used tool in the strategy surveys (nearly 80 per cent of 2,148 UK business school alumni), brainstorming is first among Ontario government analysts (91.2 per cent) and interview is first among Ukrainian business analysts (89 per cent). The review of 27 strategy studies reports that no single tool was most used across four global studies, and that benchmarking and SWOT each appeared in three.

The figures are self-reported.

#### 3.2 The least used techniques are specialised or quantitative.

Among analysts, Markov chain modelling was used by 0.8 per cent and preference scaling by 7.0 per cent, and free-form gaming or policy exercises by 6.2 per cent. In the alumni survey Bowman's strategy clock and corporate parenting matrices were hardly used.

The policy figures come from one survey with inconsistent tables.

#### 3.3 Practitioners use a handful of tools at a time.

In the alumni survey managers used one to nine tools, with four the most common number. Interviewees in the German consultant study said they mainly use five to ten tools. A consultancy survey gives an average of 7.0 tools in 2014.

The German figure is what consultants said they use, not observed practice.

#### 3.4 Consultancies report using fewer tools over time.

The Bain figures give an average of 16.1 tools in 2002, 7.4 in 2012 and 7.0 in 2014, and rankings in which benchmarking was first in 2008 and 2010 and fourth in 2013.

The figures come from a consultancy survey.

#### 3.5 Consultants use a small, adapted toolkit as support.

In the German study of 12 strategy consultants, interviewees mainly use five to ten tools, success was linked to adapting textbook tools to the client, and seven of 12 said tools should not define the core of the work. The Finnish study of 17 senior people lists methods and tasks without frequencies and reports generic approaches and over-reliance as challenges.

The evidence is two master's theses with no per-tool counts.

### 4. How use differs

#### 4.1 The leading techniques differ between kinds of work.

The strategy surveys put SWOT and benchmarking first, the policy survey puts brainstorming and consultation first, the business analysis survey puts interview and document analysis first, and one intelligence study reports that 1 in 3 analysts never used the structured techniques. Some techniques appear on several lists (cost-benefit analysis in the strategy and policy surveys, scenario analysis in the alumni and policy surveys), so the kinds of work differ in their leading techniques, and not in whole sets of techniques.

Each survey asked about a different list of tools, so the results cannot be compared directly.

#### 4.2 Consultants use more modelling and focus groups than government analysts.

Consultants used focus groups (57.3 against 37.8 per cent), sophisticated modelling tools (26.7 against 11.2) and Monte Carlo techniques (10.4 against 1.5) more than government analysts. They used checklists (33.3 against 60.1) and brainstorming (69.7 against 82.5) less. The survey is about policy consulting.

The consultant response rate was 13 per cent.

#### 4.3 The most used tool, SWOT, was not among the most valued.

The alumni survey reports that SWOT is the most used analysis tool and is not among the most valued, scenario planning is among the most valued for strategy choice and not among the most used, and Porter's five forces and PESTLE are rated most valuable for analysis. In the intelligence study, use was related to analytic training and perceived value.

This rests on one survey and one intelligence study.

### 5. Where named frameworks come from

#### 5.1 Consultancies publish named frameworks and tools under their own brands.

McKinsey's own list of classic frameworks gives, by decade: the 9-box matrix, 7-S framework and business system (1970s); the industry cost curve and SCP framework (1980s); the strategic control map and three horizons (1990s); the portfolio of initiatives (2000s); and the consumer decision journey (2010s). BCG says it created the growth share matrix in 1968 and also names time-based competition. Bain says Fred Reichheld created the Net Promoter Score in 2003, and Bain also publishes the 30 Elements of Value, The Founder's Mentality (a 2016 book by Chris Zook and James Allen) and a yearly guide to 25 management tools from a research project that began in 1993. PwC's Strategy& publishes Capabilities-Driven Strategy and a Strategy Profiler tool.

Sources: McKinsey, Enduring Ideas (https://www.mckinsey.com/spContent/Enduring%20Ideas/index.html); BCG, our history (https://bcg.com/about/overview/our-history); Bain, Net Promoter System (https://nps.bain.com/about); Bain, Management Tools and Trends (https://www.bain.com/ja/insights/management-tools-2005-an-executives-guide/); Strategy&, Capabilities-Driven Strategy (https://www.strategyand.pwc.com/tr/capabilities-driven-strategy-growth).

These are the firms' own statements of what they published.

#### 5.2 Firms report wide use of their own frameworks.

BCG says that in the late 1970s and early 1980s about half of all Fortune 500 companies used the growth share matrix or approaches based on it. Fortune reports that at least two-thirds of the Fortune 1000 use the Net Promoter Score. No independent count was found for either.

Sources: BCG, Growth share matrix: BCG classics revisited (https://www.bcg.com/en-au/publications/2014/growth-share-matrix-bcg-classics-revisited); Fortune, The simple metric that's taking over big business (https://fortune.com/longform/net-promoter-score-fortune-500-customer-satisfaction-metric/).

The BCG figure is the firm's claim.

#### 5.3 Scholars describe consultants as setters of management fashions.

Research on management fashion names consulting firms, management gurus, business media and business schools as fashion setters. It describes consultants as diffusion agents who popularise management ideas and turn abstract concepts into commercial products.

Sources: Columbia Business School, Management fashion (https://business.columbia.edu/faculty/research/management-fashion); Taylor and Francis, chapter on the diffusion of management knowledge (https://www.taylorfrancis.com/books/9781317969297/chapters/10.4324/9781315869308-6).

This comes from summaries of the research, not the papers.

#### 5.4 No tool exists for appraising sponsored surveys.

The research found no study or tool for appraising sponsored vendor or consultancy surveys. AACODS, the one checklist built for grey literature, has no item on funding. AMSTAR 2 asks about funding, and both it and ROBIS are written for health reviews. Health research on drug and device studies found that industry-sponsored studies more often reported favourable results (risk ratio 1.27) and favourable conclusions (1.34). A 2024 commentary argues that funding alone should not lower a risk of bias rating.

Sources: Cochrane methodology review MR000033 (https://www.cochrane.org/MR000033/METHOD_industry-sponsorship-and-research-outcome); AACODS checklist (https://oxfordhealth.nhs.uk/wp-content/uploads/sites/3/2024/01/AACODS_Checklist.pdf).

The health findings apply to surveys by inference.

### 6. What the catalogue does not cover

#### 6.1 Five of the twelve families were not extended to text and data.

The report on text and data did not search frame the question, decompose and map, project forward, assess actors, options and risks, or challenge. Data-driven forecasting, for example, depends only on the earlier trend extrapolation and decomposition rows.

This is a limit of the research and not evidence that text and data versions do not exist.

#### 6.2 Common methods for structured data and existing reports are missing.

Structured data alone has 14 techniques. Association, regression, cohort, change point and cross-tabulation analysis are absent. Existing reports alone have 12 techniques, and none checks percentages and totals or re-analyses published tables. Techniques that join text to tables, such as entity resolution, truth discovery, copy detection and the five mixed methods designs, have no test.

The methods are missing because no source describing them was opened, not because they lack one.

#### 6.3 Many named methods were left out because no opened source described them.

The structured data notes named duplicate and key checks, cross-tabulation, cohort analysis, regression, classification trees, change point detection, Pareto analysis, geospatial analysis, control charts, interrupted time series, propensity score matching and Granger causality tests, among others. The text notes named TF-IDF (term frequency and inverse document frequency), embedding-based semantic search, argument mining, text scaling and claim detection. The notes for combining sources named triangulation types, framework synthesis, realist synthesis, Dempster-Shafer evidence combination and Bayesian evidence synthesis. The notes for existing reports named percentage and total reconciliation, replication checks, p-curve analysis and the AXIS, RoB 2 and AGREE II appraisal instruments. The report on desk research also lists synthetic control, matching, Kepner-Tregoe analysis, concept mapping, Pareto analysis, attack trees, force field analysis and the decision matrix as not researched.

A technique is catalogued only if an opened source describes or tests it.

#### 6.4 Four terms from earlier work are not established technique names.

Trajectory analysis, absence analysis, false commensurability and contrast with a structural opposite have no defining source. The technique names attributed to Heuer and Pherson are unconfirmed.

The reports treat these as leads and not as techniques.

#### 6.5 No published procedure exists for combining sources that share no identifier.

The suggested order has five steps: define the unit, code every source to one written reference structure, resolve entities by attribute matching, record the provenance of each item, and only then compare, fuse or weight. No published procedure was found for this order, and no source gives accuracy for attribute matching without identifiers.

The order is the report's own synthesis.

### What the research did not find

The research searched for each item below and found nothing. It searched web pages and summaries of them, so a study or survey may exist that the search did not reach. Firms other than McKinsey, BCG, Bain, PwC, Deloitte and Accenture were not searched.

- A ranking of techniques by use across all desk research. The surveys cover strategy, policy, business analysis and intelligence work, each with its own list of tools.
- Use figures for data analysis, text analysis and evidence appraisal outside health.
- An independent count of the methods consultancies use.
- Named frameworks from Deloitte and Accenture.
- A technique with both a use figure and a measured accuracy figure, so the page cannot say whether popular techniques give better results.

## The techniques

The catalogue lists 304 techniques: 236 analysis techniques in the first 12 families and 68 techniques for combining and reporting in the last seven. Each row below gives the identifier, the name and the evidence status. The description, fit test and evidence for each technique are in the catalogue. Two techniques, AO-19 and PE-14, are in the catalogue and in neither report, which counted 234. Both are documented.

### Frame the question

| ID | Technique | Evidence status |
|:-|:-|:-|
| FQ-01 | PICO family | Documented |
| FQ-02 | Decision-first framing | Unconfirmed |
| FQ-03 | Definitional analysis | Documented |
| FQ-04 | Reframing and issue redefinition | Practice |
| FQ-05 | Multiple mental models | Practice |
| FQ-06 | SMART check | Practice |

### Decompose and map

| ID | Technique | Evidence status |
|:-|:-|:-|
| DM-01 | MECE decomposition and issue tree | Practice |
| DM-02 | Hypothesis tree | Unconfirmed |
| DM-03 | Morphological analysis | Documented |
| DM-04 | Value chain analysis | Documented |
| DM-05 | Taxonomy building | Documented |
| DM-06 | Affinity diagram | Documented |
| DM-07 | Lens application | Unconfirmed |
| DM-08 | Two by two matrix | Unconfirmed |
| DM-09 | PESTLE | Documented |
| DM-10 | SWOT | Documented |
| DM-11 | Porter's Five Forces | Documented |
| DM-12 | Cynefin framework | Documented |
| DM-13 | System archetypes | Documented |
| DM-14 | Leverage points | Documented |
| DM-15 | Wardley mapping | Practice |
| DM-16 | Levels-of-analysis models | Documented |
| DM-17 | Process mapping | Unconfirmed |
| DM-18 | Design structure matrix | Documented |
| DM-19 | Causal loop diagram | Documented |
| DM-20 | Stock and flow modelling | Documented |
| DM-21 | Social network analysis | Documented |

### Compare

| ID | Technique | Evidence status |
|:-|:-|:-|
| CM1-01 | Historical analogy and parallel analysis | Documented |
| CM1-02 | Mill's method of agreement and most different systems design | Documented |
| CM1-03 | Mill's method of difference and most similar systems design | Documented |
| CM1-04 | Concomitant variation and method of residues | Documented |
| CM1-05 | Comparative case study | Documented |
| CM1-06 | Case selection techniques | Unconfirmed |
| CM1-07 | Qualitative comparative analysis | Documented |
| CM1-08 | Cross-case synthesis | Unconfirmed |
| CM1-09 | Contrast with a structural opposite | Unconfirmed |
| CM1-10 | Cross-sectional and longitudinal comparison | Documented |
| CM1-11 | Before and after comparison | Unconfirmed |
| CM1-12 | Benchmarking and peer comparison | Documented |
| CM1-13 | Forecaster and source comparison | Tested |
| CM1-14 | Absence analysis | Documented |
| CM1-15 | Gap analysis | Documented |
| CM1-16 | Maturity model and capability assessment | Documented |
| CM-01 | Sponsor versus non-sponsor comparison | Documented |

### Trace cause and test claims

| ID | Technique | Evidence status |
|:-|:-|:-|
| TC1-01 | Five whys | Practice |
| TC1-02 | Fishbone diagram | Documented |
| TC1-03 | Fault tree analysis | Documented |
| TC1-04 | Process tracing | Documented |
| TC1-05 | Counterfactual analysis | Documented |
| TC1-06 | Difference-in-differences | Documented |
| TC1-07 | Quasi-experimental designs | Unconfirmed |
| TC1-08 | Confounder identification with directed acyclic graphs | Unconfirmed |
| TC1-09 | Logic model and theory of change | Documented |
| TC1-10 | Contribution analysis | Documented |
| TC1-11 | Realist evaluation | Documented |
| TC1-12 | Process evaluation and impact evaluation | Documented |
| TC1-13 | Analysis of competing hypotheses | Tested |
| TC1-14 | Coherence correction and averaging of probability judgements | Tested |
| TC1-15 | Bayesian updating | Unconfirmed |
| TC1-16 | Disconfirmation search | Documented |
| TC1-17 | Sensitivity analysis | Documented |
| TC1-18 | Internal consistency check | Unconfirmed |
| TC1-19 | Toulmin argument analysis | Documented |
| TC1-20 | Argument mapping | Unconfirmed |
| TC1-21 | Fallacy analysis | Documented |
| TC1-22 | Abduction and inference to the best explanation | Documented |
| TC1-23 | Ladder of inference | Practice |
| TC1-24 | Reflective equilibrium | Documented |
| TC1-25 | First principles reasoning | Practice |
| TC1-26 | Thought experiments | Unconfirmed |
| TC1-27 | Fermi estimation and order-of-magnitude checks | Tested |
| TC1-28 | Dimensional and unit checks | Documented |
| TC-01 | GRIM test | Documented |
| TC-02 | SPRITE | Documented |
| TC-03 | Statcheck | Tested |
| TC-04 | Claim and citation verification against source text | Tested |
| TC-05 | Subgroup and Simpson's paradox check | Documented |
| TC-06 | Ecological fallacy check | Documented |

### Handle evidence

| ID | Technique | Evidence status |
|:-|:-|:-|
| HE1-01 | Admiralty system | Documented |
| HE1-02 | Quality of information check | Documented |
| HE1-03 | CRAAP test | Documented |
| HE1-04 | SIFT | Practice |
| HE1-05 | Lateral reading | Unconfirmed |
| HE1-06 | Triangulation | Unconfirmed |
| HE1-07 | Evidence hierarchies and certainty grading | Documented |
| HE1-08 | Systematic review | Documented |
| HE1-09 | Rapid review | Documented |
| HE1-10 | Scoping review | Unconfirmed |
| HE1-11 | Meta-analysis | Documented |
| HE1-12 | Narrative, thematic and qualitative evidence synthesis | Documented |
| HE1-13 | Reflexive thematic analysis | Documented |
| HE1-14 | Framework analysis | Documented |
| HE1-15 | Content analysis | Unconfirmed |
| HE1-16 | Discourse analysis | Unconfirmed |
| HE1-17 | Grounded theory coding | Unconfirmed |
| HE1-18 | Document and policy analysis | Unconfirmed |
| HE1-19 | Bibliometric analysis | Unconfirmed |
| HE1-20 | Trend and time-series decomposition | Unconfirmed |
| HE1-21 | Distribution, outlier and base-rate checks | Unconfirmed |
| HE-01 | Grey literature appraisal checklist | Documented |
| HE-02 | Critical appraisal checklist by study design | Documented |
| HE-03 | Appraisal of a systematic review | Documented |
| HE-04 | Survey disclosure completeness check | Documented |
| HE-05 | Margin of error and credibility interval check | Documented |
| HE-06 | Opt-in panel respondent quality check | Documented |
| HE-07 | Overview of reviews | Documented |
| HE-08 | Living systematic review | Documented |

### Project forward

| ID | Technique | Evidence status |
|:-|:-|:-|
| PJ-01 | Trend extrapolation and time-series forecasting | Unconfirmed |
| PJ-02 | Reference class forecasting | Tested |
| PJ-03 | Forecasting tournaments and superforecasting practice | Tested |
| PJ-04 | Delphi technique | Documented |
| PJ-05 | Prediction markets | Tested |
| PJ-06 | Structured expert elicitation | Unconfirmed |
| PJ-07 | Technology S-curve analysis | Unconfirmed |
| PJ-08 | Bass diffusion model | Documented |
| PJ-09 | Hype cycle | Tested |
| PJ-10 | Trajectory analysis | Unconfirmed |
| PJ-11 | Agent-based modelling and Monte Carlo simulation | Unconfirmed |
| PJ-12 | Scenario planning | Tested |
| PJ-13 | Scenario matrix | Documented |
| PJ-14 | Alternative futures archetypes | Unconfirmed |
| PJ-15 | Futures wheel | Unconfirmed |
| PJ-16 | Causal layered analysis | Documented |
| PJ-17 | Cross-impact analysis | Documented |
| PJ-18 | Backcasting | Documented |
| PJ-19 | Policy stress-testing | Documented |
| PJ-20 | Wargaming and simulation exercises | Unconfirmed |
| PJ-21 | Robust decision making, adaptive pathways and info-gap analysis | Unconfirmed |
| PJ-22 | Technology roadmapping | Unconfirmed |
| PJ-23 | Horizon scanning | Documented |
| PJ-24 | Weak signal detection | Unconfirmed |
| PJ-25 | Leading indicators and signposts | Documented |

### Assess actors, options and risks

| ID | Technique | Evidence status |
|:-|:-|:-|
| AO-01 | Stakeholder analysis | Documented |
| AO-02 | Power-interest grid | Documented |
| AO-03 | Stakeholder salience model | Documented |
| AO-04 | Political economy analysis | Documented |
| AO-05 | Customer journey mapping | Documented |
| AO-06 | Personas | Documented |
| AO-07 | Jobs to be done | Practice |
| AO-08 | Eightfold path | Documented |
| AO-09 | Longlist-to-shortlist options analysis | Documented |
| AO-10 | Cost-benefit analysis | Documented |
| AO-11 | Cost-effectiveness and cost-utility analysis | Documented |
| AO-12 | Multi-criteria decision analysis | Documented |
| AO-13 | Decision tree and expected value | Documented |
| AO-14 | Real options analysis | Unconfirmed |
| AO-15 | Risk matrix | Documented |
| AO-16 | Failure mode and effects analysis | Documented |
| AO-17 | Bow-tie analysis | Documented |
| AO-18 | Threat modelling | Documented |
| AO-19 | Ranking uncertainty analysis | Documented |

### Challenge

| ID | Technique | Evidence status |
|:-|:-|:-|
| CH-01 | Key assumptions check | Documented |
| CH-02 | Strategic assumption surfacing and testing | Documented |
| CH-03 | Devil's advocacy | Documented |
| CH-04 | Team A and Team B | Documented |
| CH-05 | Red team analysis | Documented |
| CH-06 | High-impact and low-probability analysis | Documented |
| CH-07 | What if analysis | Documented |
| CH-08 | Premortem | Practice |
| CH-09 | Structured self-critique | Documented |
| CH-10 | Rapoport's rules | Documented |
| CH-11 | Steelmanning | Practice |
| CH-12 | Socratic questioning | Documented |
| CH-13 | Cognitive bias checks and debiasing | Unconfirmed |
| CH-14 | Structured brainstorming | Documented |
| CH-15 | Group process safeguards | Documented |

### Prepare and extract

| ID | Technique | Evidence status |
|:-|:-|:-|
| PE-01 | Corpus construction and sampling | Documented |
| PE-02 | Preprocessing sensitivity testing | Tested |
| PE-03 | Near-duplicate detection | Documented |
| PE-04 | Data profiling and rule-based validation | Documented |
| PE-05 | Missing data diagnosis and treatment | Documented |
| PE-06 | Keyword in context | Documented |
| PE-07 | Collocation and n-gram extraction | Documented |
| PE-08 | Named entity recognition | Documented |
| PE-09 | Relation and event extraction | Tested |
| PE-10 | Schema-based structured extraction with an LLM | Tested |
| PE-11 | Knowledge graph construction from text | Documented |
| PE-12 | Model summarisation of documents | Tested |
| PE-13 | Retrieval-augmented analysis | Tested |
| PE-14 | De-identification and re-identification risk assessment | Documented |

### Measure and model

| ID | Technique | Evidence status |
|:-|:-|:-|
| MM-01 | Exploratory data analysis with plots and distribution checks | Documented |
| MM-02 | Algorithmic outlier and anomaly detection | Documented |
| MM-03 | Clustering of records | Documented |
| MM-04 | Dimensionality reduction | Documented |
| MM-05 | Survival and duration analysis | Documented |
| MM-06 | Survey weighting and subgroup estimation | Tested |
| MM-07 | Supervised classification and dictionary methods | Tested |
| MM-08 | LLM coding and zero-shot classification of text | Tested |
| MM-09 | Sentiment analysis | Documented |
| MM-10 | Stance detection | Tested |
| MM-11 | Framing analysis at scale | Tested |
| MM-12 | Probabilistic topic modelling | Tested |
| MM-13 | Embedding-based topic modelling | Documented |
| MM-14 | Document clustering | Documented |
| MM-15 | Computer-assisted theme building | Documented |
| MM-16 | Word embeddings for concept measurement and semantic change | Tested |

### Integrate across sources

| ID | Technique | Evidence status |
|:-|:-|:-|
| IS-01 | Entity resolution and linking | Documented |
| IS-02 | Schema matching and ontology matching | Documented |
| IS-03 | Common data model harmonisation | Documented |
| IS-04 | Data fusion with conflict resolution | Documented |
| IS-05 | Truth discovery with source reliability weighting | Documented |
| IS-06 | Source dependence and copy detection | Documented |
| IS-07 | Convergent comparison of qualitative and quantitative results | Documented |
| IS-08 | Joint display | Documented |
| IS-09 | Quantitising and qualitising | Unconfirmed |
| IS-10 | Explanatory sequential integration | Documented |
| IS-11 | Exploratory sequential integration | Documented |

### Check extracted results

| ID | Technique | Evidence status |
|:-|:-|:-|
| CK-01 | Inter-coder agreement statistics | Documented |
| CK-02 | Model versus human coding agreement protocol | Tested |
| CK-03 | Bootstrap confidence intervals for agreement and accuracy | Documented |
| CK-04 | Gold-standard validation sample | Documented |
| CK-05 | Out-of-sample validation | Documented |
| CK-06 | Bias correction of model labels with a human-coded subsample | Tested |
| CK-07 | Split-sample design for measures discovered from text | Documented |
| CK-08 | Semantic, predictive and convergent validity checks | Documented |
| CK-09 | Cluster validation indexes | Documented |
| CK-10 | Repeated-run consistency test | Tested |
| CK-11 | Prompt stability scoring | Tested |
| CK-12 | Specification sweep across models and prompts | Tested |
| CK-13 | Multiple-testing correction | Documented |
| CK-14 | Data leakage audit | Documented |
| CK-15 | Sample representativeness audit | Documented |
| CK-16 | Entailment-based consistency check | Tested |
| CK-17 | Source-span and quotation check by code | Documented |
| CK-18 | Numeric and attribution recomputation by code | Unconfirmed |
| CK-19 | Atomic claim decomposition and scoring | Tested |
| CK-20 | Sampling-consistency hallucination detection | Tested |
| CK-21 | Reference-free grounding metrics for retrieval-augmented answers | Documented |
| CK-22 | LLM-as-judge with human calibration | Tested |
| CK-23 | Confidence calibration check | Tested |
| CK-24 | Review sampling design | Documented |
| CK-25 | Error taxonomy and error analysis | Documented |
| CK-26 | Independent human review of model output | Documented |
| CK-27 | Adversarial testing of an extraction pipeline | Documented |
| CK-28 | Provenance tracking and audit logging | Documented |
| CK-29 | Scripted reproducible workflow | Practice |

### Combine findings into conclusions

| ID | Technique | Evidence status |
|:-|:-|:-|
| CF-01 | Mixed methods matrix | Documented |
| CF-02 | Following a thread | Documented |
| CF-03 | Synthesis without meta-analysis reporting | Documented |
| CF-04 | Weight of evidence assessment | Unconfirmed |
| CF-05 | Non-pooling summaries of effects | Documented |
| CF-06 | Best evidence synthesis | Documented |
| CF-07 | Metainference | Documented |
| CF-08 | Assurance case | Documented |
| CF-09 | Nominal group technique and RAND/UCLA appropriateness method | Unconfirmed |

### State confidence and uncertainty

| ID | Technique | Evidence status |
|:-|:-|:-|
| UC-01 | Confidence in qualitative evidence findings | Documented |
| UC-02 | Words of estimative probability | Tested |
| UC-03 | PHIA probability yardstick | Documented |
| UC-04 | Analytical confidence rating stated apart from likelihood | Documented |
| UC-05 | IPCC calibrated uncertainty language | Tested |
| UC-06 | Traceable account | Documented |
| UC-07 | Verbal term with numeric range in the same sentence | Tested |
| UC-08 | Numeric probability statement | Tested |
| UC-09 | Point estimate with numeric range | Tested |
| UC-10 | Certainty-graded effect statements | Documented |
| UC-11 | NUSAP notation and pedigree matrix | Documented |
| UC-12 | Ordered scale of uncertainty expressions | Documented |

### Structure the written answer

| ID | Technique | Evidence status |
|:-|:-|:-|
| SA-01 | Inverted pyramid | Documented |
| SA-02 | Structure type choice | Documented |
| SA-03 | Structured abstract | Tested |
| SA-04 | Plain language summary with a standard template | Tested |
| SA-05 | 1:3:25 layered report | Documented |
| SA-06 | Policy brief | Tested |
| SA-07 | Headings and preview sentences | Tested |
| SA-08 | Pyramid principle | Unconfirmed |

### Design the display

| ID | Technique | Evidence status |
|:-|:-|:-|
| VD-01 | Encoding choice by perceptual accuracy ranking | Tested |
| VD-02 | Expressiveness and effectiveness criteria | Documented |
| VD-03 | Chart choice by message and relationship | Documented |
| VD-04 | Message headline title with statistical subtitle | Documented |
| VD-05 | Direct labelling instead of legends | Documented |
| VD-06 | Annotation | Documented |
| VD-07 | Small multiples | Documented |
| VD-08 | Focus chart | Documented |
| VD-09 | Axis baseline rules | Tested |
| VD-10 | Separate panels instead of dual axes | Documented |
| VD-11 | Category and clutter limits | Documented |
| VD-12 | Gridline and chart size settings | Tested |
| VD-13 | Narrative visualisation structures | Documented |
| VD-14 | Infographic summary | Tested |
| VD-15 | Accessible chart publishing | Documented |

### Display risk and uncertainty

| ID | Technique | Evidence status |
|:-|:-|:-|
| RU-01 | Quantile dotplot | Tested |
| RU-02 | Hypothetical outcome plots | Tested |
| RU-03 | Interval display with labelled type | Tested |
| RU-04 | Fan chart | Documented |
| RU-05 | Icon array | Tested |
| RU-06 | Absolute risk and frequency formats with consistent denominators | Tested |
| RU-07 | Both framings with a reference class | Documented |
| RU-08 | Summary of findings table | Tested |
| RU-09 | Uncertainty layer for official statistics | Documented |

### Recommend and tailor to the audience

| ID | Technique | Evidence status |
|:-|:-|:-|
| RA-01 | Evidence to decision framework | Documented |
| RA-02 | Recommendation strength labelling | Tested |
| RA-03 | Cabinet business forms | Documented |
| RA-04 | Impact analysis with a preferred option | Documented |
| RA-05 | Five case model | Documented |
| RA-06 | Audience analysis and use plan | Documented |
| RA-07 | Implications statement | Documented |
| RA-08 | Actionable messages | Documented |
| RA-09 | Knowledge brokering | Tested |
| RA-10 | Knowledge to action framework | Documented |

### Hold the report to its evidence

| ID | Technique | Evidence status |
|:-|:-|:-|
| RC-01 | Spin detection and classification | Documented |
| RC-02 | Limitations and caveats statement | Documented |
| RC-03 | Registered report and pre-registration comparison | Tested |
| RC-04 | Reporting guideline checklist | Unconfirmed |
| RC-05 | Qualitative reporting standards | Documented |
