const swaggerDocument = {
    openapi: "3.0.0",

    info: {
        title: "HelpHub API",
        version: "1.0.0",
        description: "Volunteer Coordination Platform REST API"
    },

    servers: [
        {
            url: "http://localhost:5050"
        }
    ],

    paths: {
        "/api/opportunities": {
            get: {
                summary: "Get all opportunities",
                responses: {
                    200: {
                        description: "List of opportunities"
                    }
                }
            },

            post: {
                summary: "Create an opportunity",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                responses: {
                    201: {
                        description: "Opportunity created"
                    }
                }
            }
        },

        "/api/opportunities/search": {
            get: {
                summary: "Search opportunities",
                parameters: [
                    {
                        name: "keyword",
                        in: "query",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Search results"
                    }
                }
            }
        },

        "/api/opportunities/{id}": {
            get: {
                summary: "Get an opportunity by ID",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Opportunity details"
                    }
                }
            },

            put: {
                summary: "Update an opportunity",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Opportunity updated"
                    }
                }
            },

            delete: {
                summary: "Delete an opportunity",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Opportunity deleted"
                    }
                }
            }
        },

        "/api/opportunities/{id}/photo": {
            post: {
                summary: "Upload an event photo",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    photo: {
                                        type: "string",
                                        format: "binary"
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Event photo uploaded"
                    }
                }
            }
        },

        "/api/auth/register": {
            post: {
                summary: "Register a user",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                responses: {
                    201: {
                        description: "User registered"
                    }
                }
            }
        },

        "/api/auth/login": {
            post: {
                summary: "Login a user",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                responses: {
                    200: {
                        description: "Login successful"
                    }
                }
            }
        },

        "/api/signups": {
            post: {
                summary: "Create a volunteer signup",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                responses: {
                    201: {
                        description: "Signup created"
                    }
                }
            }
        },

        "/api/signups/user/{id}": {
            get: {
                summary: "Get a volunteer's signups",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Volunteer signups"
                    }
                }
            }
        },

        "/api/signups/opportunity/{opportunityId}": {
            get: {
                summary: "Get volunteers registered for an event",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "opportunityId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Registered volunteers"
                    }
                }
            }
        },

        "/api/signups/{id}": {
            delete: {
                summary: "Delete a signup",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Signup deleted"
                    }
                }
            }
        },

        "/api/signups/{signupId}/complete": {
            post: {
                summary: "Mark a volunteer as completed",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "signupId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    hours: {
                                        type: "number"
                                    }
                                },
                                required: [
                                    "hours"
                                ]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Volunteer marked as completed"
                    }
                }
            }
        },

        "/api/hours": {
            post: {
                summary: "Add volunteer hours",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                responses: {
                    201: {
                        description: "Hours added"
                    }
                }
            }
        },

        "/api/hours/user/{id}": {
            get: {
                summary: "Get volunteer hours",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Volunteer hours"
                    }
                }
            }
        },

        "/api/organizations/logo": {
            post: {
                summary: "Upload an organization logo",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    logo: {
                                        type: "string",
                                        format: "binary"
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Organization logo uploaded"
                    }
                }
            }
        },

        "/api/certificates/{opportunityId}": {
            post: {
                summary: "Generate a volunteer certificate",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "opportunityId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    201: {
                        description: "Certificate generated"
                    }
                }
            },

            get: {
                summary: "Get an existing volunteer certificate",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "opportunityId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Certificate details"
                    }
                }
            }
        }
    },

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
};

export default swaggerDocument;