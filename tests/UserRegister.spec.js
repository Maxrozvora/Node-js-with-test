const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequalize = require('../src/config/database');

beforeAll(async () => {
    return await sequalize.sync();
});

beforeEach(async () => {
    return User.destroy({ truncate: true });
})

describe('User Registration', () => {
    it('User 200 OK when sign up request is valid', async () => {
        const responce = await request(app).post("/api/1.0/users").send({
          username: "user1",
          email: "user1@email.com",
          password: "P4ssword",
        })
        expect(responce.status).toBe(200);
    })
    
    it('It returns 200 OK when sign up request is valid', async () => {
        const response = await request(app).post("/api/1.0/users").send({
          username: "user1",
          email: "user1@email.com",
          password: "P4ssword",
        });
        expect(response.body.message).toBe("User created");
    });

    it('It saves user to database', async () => {
        const response = await request(app).post("/api/1.0/users").send({
          username: "user1",
          email: "user1@email.com",
          password: "P4ssword",
        });
        const userList = await User.findAll();
        expect(userList.length).toBe(1);
    });

    it('It saves the username and email to database', async () => {
        const response = await request(app).post("/api/1.0/users").send({
          username: "user1",
          email: "user1@email.com",
          password: "P4ssword",
        });
        const userList = await User.findAll();
        const user = userList[0];
        expect(user.username).toBe("user1");
        expect(user.email).toBe('user1@email.com')
        // expect(userList.length).toBe(1);
    });
})

