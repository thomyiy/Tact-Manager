module.exports = (sequelize, Sequelize) => {
    const Project = sequelize.define('Project', {
        // Model attributes are defined here
        name: {
            type: Sequelize.STRING,
            required: true
        }
    });
    return Project;
};