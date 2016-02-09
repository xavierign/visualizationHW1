###############################################
#### HW1 Visualization Columbia University ####
###############################################

#### 1. read pictures module
library(httr)
library(ggplot2)
library(plyr)
library(ggthemes)

faceURL <- "https://api.projectoxford.ai/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=true&returnFaceAttributes=age,gender,smile,facialHair"
faceKEY <- 'ef440fc9b6944e338edaab46d983d58f'

img.url = 'http://www.columbia.edu/~xig2000/HW1VIS/photos/'

photo.data <- data.frame(smile=NA, gender=NA, age=NA, moustache=NA, beard=NA, sideburns=NA)

photo.dirs <-rep(NA,32)
for (i in 18:24) {
  
  photo_name <- paste(c('ParticipantImageServlet (',i,').jpeg'),sep="",collapse="")
  
  url.photo <- paste(img.url,photo_name,sep="")
  photo.dirs[i] <- url.photo
    
  mybody = list(url = url.photo)

  faceResponse = POST(
    url = faceURL, 
    content_type('application/json'), add_headers(.headers = c('Ocp-Apim-Subscription-Key' = faceKEY)),
    body = mybody,
    encode = 'json'
  )

  Face = content(faceResponse)[[1]]
  attrib <- Face$faceAttributes
  print(unlist(attrib))
  if (length(unlist(attrib))==6) {
    photo.data[i+1,] <- unlist(attrib)
  } else {
    photo.data[i+1,2:6] <- unlist(attrib)
  }
}
#

#remove NAs
photo.data$smile[is.na(photo.data$smile)] <- 0

#remove outlier in age
photo.data$age[photo.data$age<21] <- 20

#build two histograms overlaped

males.ages <- photo.data[photo.data$gender=='male',c('gender','age')]
females.ages <- photo.data[photo.data$gender=='female',c('gender','age')]

#and combine into your new data frame vegLengths
ages <- rbind(males.ages, females.ages)
ages$age <- as.numeric(ages$age)

#now make your lovely plot
dev.off()
cdat <- ddply(ages, "gender", summarise, age.mean=mean(age))
cdat

# Overlaid histograms with means
ggplot(ages, aes(x=age, fill=gender)) +
  geom_histogram(binwidth=4, alpha=0.6, position="dodge") +
  geom_vline(data=cdat, aes(xintercept=age.mean,  colour=gender),
             linetype="dashed", size=1) +
  theme_few() + ggtitle("Histogram of students by gender")
