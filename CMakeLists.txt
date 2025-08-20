cmake_minimum_required(VERSION 3.28)

project(stardust-crusadiers
    VERSION 0.1.0
    DESCRIPTION "Visualize stars in cartoon style and compare them with real ones"
    LANGUAGES CXX
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(stardust-crusadiers src/main.cpp "src/main.c")