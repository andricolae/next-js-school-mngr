import React, { useState } from "react";
import "@/components/InputPassword.css";

const InputFieldPassword = (props: any) => {
    const [showPassword, setShowPassword] = useState(false);
    const errorMessage = typeof props.error === "string" ? props.error : props.error?.message;

    const handleToggle = () => {
        setShowPassword(prevState => !prevState);
    };

    return (
        <div className="flex flex-col gap-2 pt-2">
            <label className="text-xs text-gray-400">{props.label}</label>
            <div className="relative w-full">
                <input
                    type={showPassword ? "text" : "password"}
                    {...props.register(props.name)}
                    className="ring-[1.5px] ring-gray-300 p-2 pr-10 rounded-md text-sm w-full"
                    {...props.inputProps}
                    placeholder="Enter password"
                    defaultValue={props.defaultValue}
                />
                <button
                    type="button"
                    onClick={handleToggle}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                >
                    {showPassword ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    ) : (
                        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="style=linear">
                                <g id="eye-close">
                                    <path id="vector" d="M15.6487 5.39489C14.4859 4.95254 13.2582 4.72021 12 4.72021C8.46997 4.72021 5.17997 6.54885 2.88997 9.71381C1.98997 10.9534 1.98997 13.037 2.88997 14.2766C3.34474 14.9051 3.83895 15.481 4.36664 16.0002M19.3248 7.69653C19.9692 8.28964 20.5676 8.96425 21.11 9.71381C22.01 10.9534 22.01 13.037 21.11 14.2766C18.82 17.4416 15.53 19.2702 12 19.2702C10.6143 19.2702 9.26561 18.9884 7.99988 18.4547" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path id="vector_2" d="M15 12C15 13.6592 13.6592 15 12 15M14.0996 9.85541C13.5589 9.32599 12.8181 9 12 9C10.3408 9 9 10.3408 9 12C9 12.7293 9.25906 13.3971 9.69035 13.9166" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path id="vector_3" d="M2 21.0002L22 2.7002" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />
                                </g>
                            </g>
                        </svg>
                    )}
                </button>
            </div>
            {errorMessage && (
                <p className="text-xs text-red-400">{errorMessage.toString()}</p>
            )}
        </div>
    );
};

export default InputFieldPassword;
