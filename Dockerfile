FROM registry.access.redhat.com/ubi9/nodejs-18:latest as build
USER root
WORKDIR /app
COPY package.json /app
COPY . /app
RUN npm install
RUN npm run build

FROM registry.access.redhat.com/ubi9/nodejs-18:latest
USER root
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/app.js /app/app.js
RUN dnf upgrade -y
RUN dnf clean all
RUN npm install
RUN npm cache clean --force 
RUN chown -R 1001:0 /app
RUN rm -rf /app/.npm
USER 1001
EXPOSE 8080
CMD [ "sh", "-c", "node app.js" ]