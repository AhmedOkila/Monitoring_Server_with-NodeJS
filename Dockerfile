FROM node
WORKDIR /app
COPY . .
RUN npm install
#EXPOSE process.env.PORT
CMD ["npm", "start"]
