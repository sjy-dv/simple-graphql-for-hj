module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            idx: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
            comment: "앱 유저 테이블",
        }
    );
    return User;
};
