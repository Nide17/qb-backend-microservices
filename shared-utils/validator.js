const Joi = require('joi');

class Validator {
    constructor() {
        this.schemas = this.initializeSchemas();
    }

    initializeSchemas() {
        return {
            // User validation schemas
            user: {
                create: Joi.object({
                    name: Joi.string().min(2).max(100).required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().min(6).required(),
                    role: Joi.string().valid('user', 'admin', 'moderator').default('user'),
                    profile: Joi.object({
                        bio: Joi.string().max(500),
                        avatar: Joi.string().uri(),
                        preferences: Joi.object()
                    })
                }),
                update: Joi.object({
                    name: Joi.string().min(2).max(100),
                    email: Joi.string().email(),
                    profile: Joi.object({
                        bio: Joi.string().max(500),
                        avatar: Joi.string().uri(),
                        preferences: Joi.object()
                    })
                })
            },

            // Quiz validation schemas
            quiz: {
                create: Joi.object({
                    title: Joi.string().min(5).max(200).required(),
                    description: Joi.string().min(10).max(1000).required(),
                    category: Joi.string().required(),
                    difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
                    timeLimit: Joi.number().min(1).max(180).default(30),
                    questions: Joi.array().items(Joi.string()).min(1).required(),
                    isPublic: Joi.boolean().default(true),
                    tags: Joi.array().items(Joi.string())
                }),
                update: Joi.object({
                    title: Joi.string().min(5).max(200),
                    description: Joi.string().min(10).max(1000),
                    category: Joi.string(),
                    difficulty: Joi.string().valid('easy', 'medium', 'hard'),
                    timeLimit: Joi.number().min(1).max(180),
                    questions: Joi.array().items(Joi.string()),
                    isPublic: Joi.boolean(),
                    tags: Joi.array().items(Joi.string())
                })
            },

            // Question validation schemas
            question: {
                create: Joi.object({
                    text: Joi.string().min(10).max(1000).required(),
                    type: Joi.string().valid('multiple-choice', 'true-false', 'fill-blank').required(),
                    options: Joi.array().items(Joi.string()).when('type', {
                        is: 'multiple-choice',
                        then: Joi.required().min(2).max(6)
                    }),
                    correctAnswer: Joi.alternatives().conditional('type', {
                        switch: [
                            { is: 'multiple-choice', then: Joi.number().min(0).required() },
                            { is: 'true-false', then: Joi.boolean().required() },
                            { is: 'fill-blank', then: Joi.string().required() }
                        ]
                    }),
                    explanation: Joi.string().max(500),
                    difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
                    tags: Joi.array().items(Joi.string())
                })
            },

            // Category validation schemas
            category: {
                create: Joi.object({
                    name: Joi.string().min(2).max(100).required(),
                    description: Joi.string().max(500),
                    slug: Joi.string().lowercase().pattern(/^[a-z0-9-]+$/).required(),
                    parent: Joi.string().allow(null),
                    isActive: Joi.boolean().default(true)
                })
            },

            // Score validation schemas
            score: {
                create: Joi.object({
                    user: Joi.string().required(),
                    quiz: Joi.string().required(),
                    score: Joi.number().min(0).max(100).required(),
                    timeTaken: Joi.number().min(0).required(),
                    answers: Joi.array().items(Joi.object({
                        question: Joi.string().required(),
                        selectedAnswer: Joi.any().required(),
                        isCorrect: Joi.boolean().required(),
                        timeSpent: Joi.number().min(0)
                    }))
                })
            },

            // Comment validation schemas
            comment: {
                create: Joi.object({
                    content: Joi.string().min(1).max(1000).required(),
                    user: Joi.string().required(),
                    quiz: Joi.string().when('type', {
                        is: 'quiz-comment',
                        then: Joi.required()
                    }),
                    question: Joi.string().when('type', {
                        is: 'question-comment',
                        then: Joi.required()
                    }),
                    parent: Joi.string().allow(null),
                    type: Joi.string().valid('quiz-comment', 'question-comment').required()
                })
            },

            // Common pagination schema
            pagination: Joi.object({
                page: Joi.number().min(1).default(1),
                limit: Joi.number().min(1).max(100).default(20),
                sortBy: Joi.string(),
                sortOrder: Joi.string().valid('asc', 'desc').default('desc')
            }),

            // Search schema
            search: Joi.object({
                q: Joi.string().min(1).required(),
                type: Joi.string().valid('quizzes', 'users', 'posts', 'courses', 'all').default('all'),
                page: Joi.number().min(1).default(1),
                limit: Joi.number().min(1).max(100).default(20)
            })
        };
    }

    // Validate request data against a schema
    validate(data, schemaName, operation = 'create') {
        const schema = this.schemas[schemaName]?.[operation] || this.schemas[schemaName];

        if (!schema) {
            throw new Error(`Schema not found: ${schemaName}.${operation}`);
        }

        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: false
        });

        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));

            throw {
                name: 'ValidationError',
                message: 'Validation failed',
                errors: validationErrors
            };
        }

        return value;
    }

    // Validate pagination parameters
    validatePagination(query) {
        return this.validate(query, 'pagination');
    }

    // Validate search parameters
    validateSearch(query) {
        return this.validate(query, 'search');
    }

    // Custom validation methods
    validateObjectId(id) {
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        if (!objectIdPattern.test(id)) {
            throw {
                name: 'ValidationError',
                message: 'Invalid ObjectId format',
                field: 'id'
            };
        }
        return id;
    }

    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            throw {
                name: 'ValidationError',
                message: 'Invalid email format',
                field: 'email'
            };
        }
        return email;
    }

    validatePassword(password) {
        if (password.length < 6) {
            throw {
                name: 'ValidationError',
                message: 'Password must be at least 6 characters long',
                field: 'password'
            };
        }
        return password;
    }

    // Sanitize data (remove sensitive fields)
    sanitize(data, fieldsToRemove = []) {
        const sanitized = { ...data };
        fieldsToRemove.forEach(field => {
            delete sanitized[field];
        });
        return sanitized;
    }

    // Validate and sanitize in one operation
    validateAndSanitize(data, schemaName, operation = 'create', fieldsToRemove = []) {
        const validated = this.validate(data, schemaName, operation);
        return this.sanitize(validated, fieldsToRemove);
    }
}

module.exports = Validator;
