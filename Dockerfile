FROM node:14

WORKDIR /usr/app

COPY package*.json ./
COPY prisma prisma

RUN npm ci --only=production
RUN npx prisma generate

COPY dist dist

CMD [ "npm", "start" ]