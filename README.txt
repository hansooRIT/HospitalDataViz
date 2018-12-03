Description of the data set
I chose a data set of medical imaging data across multiple hospitals across the U.S. It originated from Medicare's website, so it is trusted information coming from a government source regarding hospital information.
As far as manipulation went, I used openrefine to remove a large amount of fields such as specific location, patient check in and out times, and phone numbers. I kept some of the specific information data such as county and town as 
I wanted to have an option to be more specific instead of being pretty broad by going with states. I also kept the provider id and hospital name as other avenues for data initially, but further research determined that
each hospital and provider has a degree of standardization in this data set. Each hospital and provider has 6 different records in the data base. No more, no less, so keeping them around would not have yielded any information.
This standardization was unfortunate, as seeing simple usage data with no trimming from the data provider would have yielded differences in treatment types, diversifying the data set. But, what's done is done, and the data
set is still accurage, in spite of the trimming.

Then I had to parse the data proper using client side Javascript. After passing in rows of the database through an initial row converter, I had to map things such as state count or average score per state to map objects,
eventually combining all of the map objects to a single Javascript array for use with d3. This was done in two separate instance, once for most of the regular data, and once specifically for deriving information regarding
scores for each individual treatment, which required some more indepth derivation using maps.

Why?
The charts ended up being 1 scatter plot and 3 bar graphs; 2 of which were vertically aligned with the 1 being horizontally aligned. The decision to start with a scatter plot of the usage data vs. the cardiac calcium score
was to first see if there was a correlation between usage and score. However, due to the scatter plot having 2 different channels, and generally being really full of information due to the sheer size of the data set,
the viewer may not glean much information from the graph at a glance, which led to the use of a mouse hover event to clearly state some information in the form of a tooltip. Also, the lack of text in the scatter plot itself was
to reduce visual noise in the graph, as the text would have been layered on top of itself and other points due to the sheer amount of data points.

This leads into the second graph, which is a simple 2 channel bar graph meant to display a state's total usage of medical imaging. However, the two channel for this are horizontal length and color, which are different magnitude
channels than simple x-y position like the first graph, so it offers the viewer a different way of seeing part of the same information. The fact that this is univariate instead of bivariate means that there is less information 
that the reader may struggle to interpret, so it felt necessary to include it as a supplement to the scatter plot. The mouse events from the previous graph persist throughout all of the graphs as an easy to read medium to parse 
all of the information of a specific mark if need be. The color of the currently viewed node changes to a dark color to indicate that this is the data set that the pop up is refering to, just to make it easy for the viewer to 
understand that. Also, the choice to make it a vertically aligned graph is due to the sheer number of data points in addition to the anticipated viewing medium. As this page will be viewed on a PC, there is more horizontal room
 on a computer screen, so utilization of that would ultimately make a better looking page.

The third graph borrows much of the same design ethos as the second graph, only displaying different data in the form of excluded cases. The footnotes of the data specified cases where no cardiac calcium score was recorded for whatever
reason, so visualizing that and explaining that this may have a significant effect on the data's accuracy seemed necessary to visualize and explain. Not much to explain here due to the overlap between this and the second graph.

The last graph is a horizontally aligned bar graph with some important nominal data that needed to be displayed at the forefront. The specific imaging types in conjunction with their average cardiac calcium score needed to be displayed
upfront, so the type text was integrated into the graph itself, being positioned above its respective bar. The text placement is between each bar, and the ordering of it makes it intuitive for reader to know which bar corresponds with
which label. Due to having less data points, I felt comfortable with aligning the graph horizontally as a means of integrating the labels into the graph itself.

Ultimately, these are all pretty simple graphs with their specific information being supplemented by mouse events providing tooltips. The graphs themselves are easy to read and not obstructive with any extra visual noise to detract 
from the information itself, which really should be the function of any data visualization.