import { server } from "../server/app";
import request from 'supertest'


// Our main block
afterAll(done => {
  server.close();
  done();
});


describe ('/GET data', () => {
   it('it should GET all the USERS', (done) => {
   request(server)
  .get('/api/data')
  .expect('Content-Type', 'application/json')
  .expect(200)
  done()
  });
});

describe('/POST data', () => {
  it('should create a new post', async () => {
      request(server)
      .post('/api/data')
      .send({
        id: "914d3ab3-2b95-43c5-bf20-c2e316880618",
        organization: 'net ninja',
      })
      .expect(201)
      .expect('Content-Type', 'application/json')
  })
});




